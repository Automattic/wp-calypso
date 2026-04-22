/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AtmosphereView from '../atmosphere-view';

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

describe( 'AtmosphereView', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders empty state, connects, and verifies', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/atmosphere/connections' ).reply( 200, { connections: [] } );

		renderWithProvider( <AtmosphereView />, { queryClient: makeClient() } );
		await waitFor( () =>
			expect( screen.getByText( /no bluesky accounts connected yet/i ) ).toBeVisible()
		);

		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connection: { id: 101, handle: 'alice.bsky.social', did: 'did:plc:a', avatar: null },
			} );
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connections: [ { id: 101, handle: 'alice.bsky.social', did: 'did:plc:a', avatar: null } ],
			} );

		const user = userEvent.setup();
		await user.type( screen.getByLabelText( /handle/i ), 'alice.bsky.social' );
		await user.type( screen.getByLabelText( /app password/i ), 'xxxx-xxxx-xxxx-xxxx' );
		await user.click( screen.getByRole( 'button', { name: /connect/i } ) );

		await waitFor( () => expect( screen.getByText( '@alice.bsky.social' ) ).toBeVisible() );

		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/101/verify' )
			.reply( 200, {
				did: 'did:plc:a',
				handle: 'alice.bsky.social',
				display_name: 'Alice',
				description: 'hi',
				avatar: null,
				banner: null,
				counts: { followers: 1, follows: 2, posts: 3 },
				raw: {},
			} );

		await user.click( screen.getByRole( 'button', { name: /verify/i } ) );
		await waitFor( () => expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible() );
	} );
} );
