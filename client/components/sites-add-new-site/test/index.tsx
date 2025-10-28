/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SitesAddNewSitePopover } from '../index';

// Mock dependencies
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
	localize: ( x ) => x,
} ) );

// Mock the AsyncContent component to avoid loading issues in tests
jest.mock( '../async', () => ( {
	AsyncContent: () => <div data-testid="async-content">Async Content</div>,
} ) );

// Mock fetchUser to provide auth data
jest.mock( '@automattic/api-core', () => ( {
	fetchUser: jest.fn( () =>
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
		jest.clearAllMocks();
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
