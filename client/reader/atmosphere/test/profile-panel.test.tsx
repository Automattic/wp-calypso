/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ProfilePanel } from '../profile-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

const connection: AtmosphereConnection = {
	id: 101,
	handle: 'alice.bsky.social',
	display_name: 'Alice',
	did: 'did:plc:a',
	avatar: null,
};

describe( 'ProfilePanel', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders the verified profile for the passed connection', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/101' )
			.reply( 200, {
				did: 'did:plc:a',
				handle: 'alice.bsky.social',
				display_name: 'Alice',
				description: 'hello there',
				avatar: null,
				banner: null,
				counts: { followers: 10, follows: 5, posts: 42 },
				raw: {},
			} );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'hello there' ) ).toBeVisible() );
		const stats = screen.getByRole( 'list', { name: /profile stats/i } );
		expect( stats ).toHaveTextContent( '42 posts' );
		expect( stats ).toHaveTextContent( '10 followers' );
	} );
} );
