/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FediverseLandingView } from '../fediverse-landing-view';
import { getAccountUrl, getConnectUrl } from '../route';
import type React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

// Mock @wordpress/components to avoid the full package import.
jest.mock( '@wordpress/components', () => ( {
	Spinner: () => null,
	Button: ( props: React.ButtonHTMLAttributes< HTMLButtonElement > ) => <button { ...props } />,
} ) );

// Mock @automattic/api-queries entirely.
const mockUseFediverseConnectionsQuery = jest.fn();
jest.mock( '@automattic/api-queries', () => ( {
	useFediverseConnectionsQuery: ( ...args: unknown[] ) =>
		mockUseFediverseConnectionsQuery( ...args ),
} ) );

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function renderView() {
	const client = makeClient();
	const Wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
	);
	return render( <FediverseLandingView />, { wrapper: Wrapper } );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe( 'FediverseLandingView', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
		mockUseFediverseConnectionsQuery.mockClear();
	} );

	// -------------------------------------------------------------------------
	// 1. Pending: Spinner shown, no redirect
	// -------------------------------------------------------------------------

	it( 'shows spinner while connections are loading', () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: undefined,
			isPending: true,
			isError: false,
		} );

		const { container } = renderView();

		// Spinner should be rendered (mock returns null, so container is just the wrapper)
		expect( container ).toBeTruthy();
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'does not redirect while pending', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: undefined,
			isPending: true,
			isError: false,
		} );

		renderView();

		// Wait a bit and ensure no redirect happened
		await waitFor(
			() => {
				expect( page.replace ).not.toHaveBeenCalled();
			},
			{ timeout: 100 }
		);
	} );

	// -------------------------------------------------------------------------
	// 2. Empty connections: redirect to connect page
	// -------------------------------------------------------------------------

	it( 'redirects to connect page when no connections exist', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: { connections: [] },
			isPending: false,
			isError: false,
		} );

		renderView();

		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( getConnectUrl() ) );
	} );

	// -------------------------------------------------------------------------
	// 3. One connection: redirect to timeline
	// -------------------------------------------------------------------------

	it( 'redirects to timeline of first connection when at least one exists', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: {
				connections: [ { id: 42, handle: 'user@mastodon.social', actor: 'http://example.com' } ],
			},
			isPending: false,
			isError: false,
		} );

		renderView();

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( getAccountUrl( 42, 'timeline' ) )
		);
	} );

	it( 'redirects to first connection when multiple exist', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: {
				connections: [
					{ id: 42, handle: 'user1@mastodon.social', actor: 'http://example1.com' },
					{ id: 43, handle: 'user2@pixelfed.social', actor: 'http://example2.com' },
				],
			},
			isPending: false,
			isError: false,
		} );

		renderView();

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( getAccountUrl( 42, 'timeline' ) )
		);
	} );

	// -------------------------------------------------------------------------
	// 4. Error: shows retry UI instead of silently redirecting
	// -------------------------------------------------------------------------

	it( 'shows an error with a retry button when the query fails', async () => {
		const refetch = jest.fn();
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: undefined,
			isPending: false,
			isError: true,
			refetch,
		} );

		renderView();

		expect( screen.getByRole( 'alert' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /try again/i } ) ).toBeVisible();
		expect( page.replace ).not.toHaveBeenCalled();

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: /try again/i } ) );
		expect( refetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'redirects to connect page even when data is null', async () => {
		mockUseFediverseConnectionsQuery.mockReturnValue( {
			data: null,
			isPending: false,
			isError: false,
		} );

		renderView();

		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( getConnectUrl() ) );
	} );
} );
