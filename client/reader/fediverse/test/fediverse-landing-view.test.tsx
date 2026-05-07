/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FediverseLandingView } from '../fediverse-landing-view';

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

describe( 'FediverseLandingView', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders the empty-state prompt when the user has no connections', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/fediverse/connections' ).reply( 200, { connections: [] } );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		await waitFor( () =>
			expect( screen.getByText( 'Connect your first Fediverse account' ) ).toBeVisible()
		);
		const action = screen.getByRole( 'link', { name: 'Connect a site' } );
		expect( action ).toHaveAttribute( 'href', '/reader/fediverse/connect' );
	} );

	it( 'renders an account card per connection with a link to its timeline tab', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections' )
			.reply( 200, {
				connections: [
					{
						id: 7,
						handle: 'alice@example.com',
						site_host: 'example.com',
						actor_url: 'https://example.com/@alice',
						display_name: 'Alice',
						avatar: null,
					},
					{
						id: 8,
						handle: 'bob@blog.test',
						site_host: 'blog.test',
						actor_url: 'https://blog.test/author/bob',
						display_name: null,
						avatar: 'https://blog.test/avatar.png',
					},
				],
			} );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		// First account uses display_name; the Open link points at the
		// timeline tab for that connection's id.
		await waitFor( () => expect( screen.getByText( 'Alice' ) ).toBeVisible() );
		const openLinks = screen.getAllByRole( 'link', { name: 'Open' } );
		expect( openLinks[ 0 ] ).toHaveAttribute( 'href', '/reader/fediverse/7/timeline' );
		expect( openLinks[ 1 ] ).toHaveAttribute( 'href', '/reader/fediverse/8/timeline' );

		// The second account falls back to handle when display_name is null.
		expect( screen.getByText( 'bob@blog.test' ) ).toBeVisible();

		// "Connect another account" link points at the connect flow.
		const addLink = screen.getByRole( 'link', { name: 'Connect another account' } );
		expect( addLink ).toHaveAttribute( 'href', '/reader/fediverse/connect' );
	} );

	it( 'renders an error state with a Try again button when the connections query fails', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/fediverse/connections' ).reply( 500, { error: 'unknown' } );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		await waitFor( () =>
			expect( screen.getByText( "We couldn't load your Fediverse accounts." ) ).toBeVisible()
		);
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
	} );
} );
