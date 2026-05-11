/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FediverseLandingView } from '../fediverse-landing-view';
import type React from 'react';

// `ReaderMain` mounts `<sync-reader-follows>`, which selects from a Redux
// branch the test store doesn't seed. Stub out to a passthrough.
jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

describe( 'FediverseLandingView', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
	} );
	afterEach( () => nock.cleanAll() );

	it( 'redirects to /:firstId/timeline when connections resolve', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections' )
			.reply( 200, {
				connections: [
					{
						id: 7,
						blog_id: 700,
						url: 'https://example.com',
						name: 'Example Blog',
						icon: '',
						webfinger: '@example@example.com',
					},
				],
			} );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/fediverse/7/timeline' )
		);
	} );

	it( 'renders the empty-state prompt when the user has no AP-enabled blogs', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/fediverse/connections' ).reply( 200, { connections: [] } );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		await waitFor( () => expect( screen.getByText( 'No Fediverse accounts yet' ) ).toBeVisible() );
		// Empty state is terminal — connections are pre-minted server-side
		// per CM-684, so there's no user-driven OAuth flow / connect CTA.
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'shows an error with a retry button when the connections query fails', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/fediverse/connections' ).reply( 500, { error: 'unknown' } );

		renderWithProvider( <FediverseLandingView />, { queryClient: makeClient() } );

		await waitFor( () =>
			expect( screen.getByText( 'We couldn’t load your Fediverse accounts.' ) ).toBeVisible()
		);
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
		expect( page.replace ).not.toHaveBeenCalled();
	} );
} );
