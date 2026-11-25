/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { SitesAddNewSitePopover } from '../index';

// Mock dependencies
vi.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useTranslate: () => ( text: string ) => text,
		localize: ( x ) => x,
	} )
);

// Mock the AsyncContent component to avoid loading issues in tests
vi.mock( '../async', () => ( {
	AsyncContent: () => <div data-testid="async-content">Async Content</div>,
} ) );

// Mock the analytics client to avoid needing a Redux store
vi.mock( 'calypso/sites/v2/hooks/use-analytics-client', () => ( {
	useAnalyticsClient: () => ( {
		recordTracksEvent: vi.fn(),
		recordPageView: vi.fn(),
	} ),
} ) );

// Mock fetchUser to provide auth data
vi.mock( '@automattic/api-core', () => ( {
	fetchUser: vi.fn( () =>
		Promise.resolve( {
			ID: 123,
			username: 'testuser',
			email: 'test@example.com',
			language: 'en',
			logout_URL: 'https://wordpress.com/logout',
		} )
	),
} ) );

describe( 'SitesAddNewSitePopover', () => {
	const sitesDashboardContext = 'sites-dashboard';
	let queryClient: QueryClient;

	const renderWithQueryClient = ( component: React.ReactElement ) => {
		return render(
			<QueryClientProvider client={ queryClient }>{ component }</QueryClientProvider>
		);
	};

	beforeEach( () => {
		vi.clearAllMocks();
		queryClient = new QueryClient( {
			defaultOptions: {
				queries: { retry: false },
			},
		} );
	} );

	it( 'renders with full label when not in compact mode', async () => {
		renderWithQueryClient(
			<SitesAddNewSitePopover showCompact={ false } context={ sitesDashboardContext } />
		);
		await waitFor( () => {
			expect( screen.getByText( 'Add new site' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders without label in compact mode', async () => {
		renderWithQueryClient(
			<SitesAddNewSitePopover showCompact context={ sitesDashboardContext } />
		);
		await waitFor( () => {
			expect( screen.queryByText( 'Add new site' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'tracks event when dropdown is opened', async () => {
		renderWithQueryClient(
			<SitesAddNewSitePopover showCompact={ false } context={ sitesDashboardContext } />
		);
		await waitFor( () => {
			expect( screen.getByRole( 'button' ) ).toBeInTheDocument();
		} );
		const button = screen.getByRole( 'button' );
		fireEvent.click( button );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_sites_dashboard_new_site_action_click_open'
		);
	} );

	it( 'closes popover when clicking the button again', async () => {
		renderWithQueryClient(
			<SitesAddNewSitePopover showCompact={ false } context={ sitesDashboardContext } />
		);
		await waitFor( () => {
			expect( screen.getByRole( 'button' ) ).toBeInTheDocument();
		} );
		const button = screen.getByRole( 'button' );
		fireEvent.click( button );
		expect( screen.getByTestId( 'async-content' ) ).toBeInTheDocument();

		// Click button again
		fireEvent.click( button );
		await waitFor( () => {
			expect( screen.queryByTestId( 'async-content' ) ).not.toBeInTheDocument();
		} );
	} );
} );
