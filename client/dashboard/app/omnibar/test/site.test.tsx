/**
 * @jest-environment jsdom
 */
import { omnibarSiteIdQuery, queryClient } from '@automattic/api-queries';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { AUTH_QUERY_KEY } from '../../auth';
import { useSyncOmnibarSite } from '../site';
import type { User } from '@automattic/api-core';

function OmnibarProbe() {
	useSyncOmnibarSite();
	return null;
}

describe( 'useSyncOmnibarSite', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	test( 'records the recent site only once when the preference write keeps failing', async () => {
		queryClient.setQueryData( AUTH_QUERY_KEY, { ID: 1, primary_blog: 123 } as User );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: { recentSites: [ 999 ] } } );

		// Sites are returned without `capabilities`, so they aren't treated as
		// member sites and the omnibar falls back to the user's primary blog.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( /\/rest\/v1\.1\/sites\/\d+/ )
			.query( true )
			.reply( 200, ( uri ) => ( { ID: Number( uri.match( /sites\/(\d+)/ )?.[ 1 ] ) } ) );

		// The failure path logs to logstash.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/logstash' )
			.reply( 200, {} );

		// The recent-sites write always fails. Before the fix, the optimistic
		// mutation's rollback changed `recentSites`, re-triggering the effect that
		// fired the write, so it retried forever.
		let postCount = 0;
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/preferences' )
			.reply( () => {
				postCount += 1;
				return [ 405, { error: 'not_allowed' } ];
			} );

		render( <OmnibarProbe /> );

		await waitFor( () => expect( postCount ).toBeGreaterThanOrEqual( 1 ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 200 ) );

		expect( postCount ).toBe( 1 );

		// The omnibar still resolves to the primary blog and publishes it as shared state.
		expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBe( 123 );
	} );
} );
