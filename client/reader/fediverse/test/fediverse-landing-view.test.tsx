/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FediverseLandingView } from '../fediverse-landing-view';
import type React from 'react';

// `ReaderMain` mounts `<sync-reader-follows>`, which selects from a Redux
// branch the test store doesn't seed. Stub out to a passthrough so the
// landing view renders standalone.
jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

describe( 'FediverseLandingView', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders the empty-state prompt when the user has no AP-enabled blogs', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/fediverse/connections' ).reply( 200, { connections: [] } );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		await waitFor( () => expect( screen.getByText( 'No Fediverse accounts yet' ) ).toBeVisible() );
		// Empty-state has no "connect" CTA — connections are pre-minted
		// server-side per CM-684, so there's no user-driven OAuth flow.
		expect( screen.queryByRole( 'link', { name: /connect/i } ) ).not.toBeInTheDocument();
	} );

	it( 'renders an account card per connection with an Open link to its timeline', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections' )
			.reply( 200, {
				connections: [
					{
						id: 7,
						blog_id: 700,
						url: 'https://example.com',
						name: 'Alice',
						icon: '',
						webfinger: '@alice@example.com',
					},
					{
						id: 8,
						blog_id: 800,
						url: 'https://blog.test',
						name: '',
						icon: 'https://blog.test/avatar.png',
						webfinger: '@bob@blog.test',
					},
				],
			} );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		// First account uses `name`; the Open link points at the timeline
		// tab for that connection's id.
		await waitFor( () => expect( screen.getByText( 'Alice' ) ).toBeVisible() );
		const openLinks = screen.getAllByRole( 'link', { name: 'Open' } );
		expect( openLinks[ 0 ] ).toHaveAttribute( 'href', '/reader/fediverse/7/timeline' );
		expect( openLinks[ 1 ] ).toHaveAttribute( 'href', '/reader/fediverse/8/timeline' );

		// Second account: empty `name` falls back to `webfinger` for the
		// display label, so the handle string appears in both the name
		// and handle slots — at least one must be visible.
		expect( screen.getAllByText( '@bob@blog.test' ).length ).toBeGreaterThan( 0 );
	} );

	it( 'renders an error state with a Try again button when the connections query fails', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/fediverse/connections' ).reply( 500, { error: 'unknown' } );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		await waitFor( () =>
			expect( screen.getByText( 'We couldn’t load your Fediverse accounts.' ) ).toBeVisible()
		);
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
	} );
} );
