/**
 * @jest-environment jsdom
 */
import { omnibarSiteIdQuery, queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import { act, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { AUTH_QUERY_KEY } from '../../auth';
import { useSyncOmnibarSite } from '../site';
import type { User, UserPreferences } from '@automattic/api-core';

function OmnibarProbe() {
	useSyncOmnibarSite();
	return null;
}

// Flush pending microtasks/effects so a hypothetical re-triggered write would fire.
function flush() {
	return act( async () => {} );
}

describe( 'useSyncOmnibarSite', () => {
	afterEach( () => {
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

		// The write is attempted (optimistically setting `recentSites` to `[ 123, 999 ]`)…
		await waitFor( () => expect( postCount ).toBe( 1 ) );
		// …then fails and rolls `recentSites` back to `[ 999 ]`. That rollback is the
		// exact event the old bug re-fired the write from; once it settles, no retry.
		await waitFor( () =>
			expect(
				queryClient.getQueryData< UserPreferences >( rawUserPreferencesQuery().queryKey )
					?.recentSites
			).toEqual( [ 999 ] )
		);
		await flush();

		expect( postCount ).toBe( 1 );

		// The omnibar still resolves to the primary blog and publishes it as shared state.
		expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBe( 123 );
	} );

	test( 'does not attempt a write when reading preferences fails', async () => {
		queryClient.setQueryData( AUTH_QUERY_KEY, { ID: 1, primary_blog: 123 } as User );

		// Reading preferences fails, so a write would likely fail too — we bail out.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.reply( 403, { error: 'unauthorized' } );

		let postCount = 0;
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/preferences' )
			.reply( () => {
				postCount += 1;
				return [ 200, {} ];
			} );

		render( <OmnibarProbe /> );

		// Wait for the preferences read to fail, then confirm no write followed.
		await waitFor( () =>
			expect( queryClient.getQueryState( rawUserPreferencesQuery().queryKey )?.status ).toBe(
				'error'
			)
		);
		await flush();

		expect( postCount ).toBe( 0 );
	} );
} );
