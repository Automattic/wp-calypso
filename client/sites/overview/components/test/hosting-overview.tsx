/**
 * @jest-environment jsdom
 */
import { MigrationStatus } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import * as siteActions from 'calypso/state/sites/actions';
import HostingOverview from '../hosting-overview';
import type { SiteDetails } from '@automattic/data-stores';
// Store original location so we can restore it after all tests.
const originalLocation = window.location;

// Mock the QuerySitePlans component to return null as it dispatches
// a non-object thunk action that isn't handled by the mocked Redux store.
jest.mock( 'calypso/components/data/query-site-plans', () => jest.fn( () => null ) );

const localRenderWithProvider = ( element, { initialState } ) => {
	const mockStore = configureStore();
	const store = mockStore( initialState );

	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ element }</Provider>
		</QueryClientProvider>
	);
};

const mockSiteId = 123;

type MockSiteOptions = {
	is_wpcom_atomic?: boolean;
	migrationStatus?: MigrationStatus;
	migrationSticker?: string;
};

const buildMockSite = ( {
	is_wpcom_atomic = false,
	migrationStatus = MigrationStatus.UNKNOWN,
	migrationSticker,
}: MockSiteOptions ): SiteDetails => {
	return {
		ID: mockSiteId,
		slug: 'test-site.wordpress.com',
		URL: 'https://test-site.wordpress.com',
		capabilities: {
			activate_plugins: false,
			activate_wordads: false,
			delete_others_posts: true,
			delete_posts: true,
			delete_users: true,
			edit_others_pages: true,
			edit_others_posts: true,
			edit_pages: true,
			edit_posts: true,
			edit_theme_options: true,
			edit_users: true,
			list_users: true,
			manage_categories: true,
			manage_options: true,
			moderate_comments: true,
			own_site: true,
			promote_users: true,
			publish_posts: true,
			remove_users: true,
			upload_files: true,
			update_plugins: false,
			view_hosting: true,
			view_stats: true,
		},
		description: 'Test site description',
		domain: 'test-site.wordpress.com',
		jetpack: true,
		launch_status: 'launched',
		locale: 'en_US',
		is_wpcom_atomic,
		logo: {
			id: '123',
			sizes: [ 'thumbnail', 'medium', 'large' ],
			url: 'https://test-site.wordpress.com/logo.png',
		},
		name: 'Test Site',
		title: 'Test Site',
		site_migration: {
			status: migrationStatus,
			last_modified: '2025-03-03',
			migration_status: migrationSticker,
		},
	};
};

const mockCalypsoState = {
	currentUser: {
		capabilities: {},
		flags: [],
	},
	purchases: {
		isFetchingSitePurchases: true,
	},
	sites: {
		items: {
			[ mockSiteId ]: buildMockSite( {} ),
		},
		plans: {
			[ mockSiteId ]: {
				data: null,
				error: null,
				hasLoadedFromServer: false,
				isRequesting: true,
			},
		},
		requesting: {},
		requestingAll: false,
	},
	ui: {
		selectedSiteId: mockSiteId,
	},
};

const mockRequestSiteAction = {
	type: 'SITE_REQUEST',
	siteId: mockSiteId,
};

describe( 'HostingOverview', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	describe( 'when refresh parameter is not true', () => {
		beforeEach( () => {
			window.location.search = '';
		} );

		it( 'should load the page and not request site details', () => {
			requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByTestId, getByText } = localRenderWithProvider( <HostingOverview />, {
				initialState: mockCalypsoState,
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();

			waitFor( () => {
				// SiteBackupCard
				expect( getByText( 'Site backup' ) ).toBeVisible();
				// QuickActionsCard
				expect( getByText( 'Command Palette' ) ).toBeVisible();
				// ActiveDomainsCard
				expect( getByText( 'Active domains' ) ).toBeVisible();
				// SupportCard
				expect( getByText( 'Need some help?' ) ).toBeVisible();

				expect( getByTestId( 'hosting-overview-loading' ) ).not.toBeVisible();
			} );
		} );

		it( 'should not request the site details when refresh is present', () => {
			window.location.search = '?refresh';

			requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByTestId, getByText } = localRenderWithProvider( <HostingOverview />, {
				initialState: mockCalypsoState,
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();

			waitFor( () => {
				// SiteBackupCard
				expect( getByText( 'Site backup' ) ).toBeVisible();
				// QuickActionsCard
				expect( getByText( 'Command Palette' ) ).toBeVisible();
				// ActiveDomainsCard
				expect( getByText( 'Active domains' ) ).toBeVisible();
				// SupportCard
				expect( getByText( 'Need some help?' ) ).toBeVisible();

				expect( getByTestId( 'hosting-overview-loading' ) ).not.toBeVisible();
			} );
		} );

		it( 'should load the page when the current site details are being requested', () => {
			const initialState = {
				...mockCalypsoState,
				sites: {
					...mockCalypsoState.sites,
					requesting: {
						[ mockSiteId ]: true,
					},
				},
			};

			requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByTestId, getByText } = localRenderWithProvider( <HostingOverview />, {
				initialState,
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();

			waitFor( () => {
				// SiteBackupCard
				expect( getByText( 'Site backup' ) ).toBeVisible();
				// QuickActionsCard
				expect( getByText( 'Command Palette' ) ).toBeVisible();
				// ActiveDomainsCard
				expect( getByText( 'Active domains' ) ).toBeVisible();
				// SupportCard
				expect( getByText( 'Need some help?' ) ).toBeVisible();

				expect( getByTestId( 'hosting-overview-loading' ) ).not.toBeVisible();
			} );
		} );

		it( 'should load the page when all site details are being requested', () => {
			const initialState = {
				...mockCalypsoState,
				sites: {
					...mockCalypsoState.sites,
					requestingAll: true,
				},
			};

			requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByTestId, getByText } = localRenderWithProvider( <HostingOverview />, {
				initialState,
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();

			waitFor( () => {
				// SiteBackupCard
				expect( getByText( 'Site backup' ) ).toBeVisible();
				// QuickActionsCard
				expect( getByText( 'Command Palette' ) ).toBeVisible();
				// ActiveDomainsCard
				expect( getByText( 'Active domains' ) ).toBeVisible();
				// SupportCard
				expect( getByText( 'Need some help?' ) ).toBeVisible();

				expect( getByTestId( 'hosting-overview-loading' ) ).not.toBeVisible();
			} );
		} );
	} );

	describe( 'when refresh parameter is true', () => {
		beforeEach( () => {
			window.location.search = '?refresh=true';
		} );

		it( 'should request the site details when no site data is being requested', () => {
			requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );
			requestSiteSpy.mockImplementation( () => {
				return mockRequestSiteAction;
			} );

			const { getByTestId } = localRenderWithProvider( <HostingOverview />, {
				initialState: mockCalypsoState,
			} );

			expect( requestSiteSpy ).toHaveBeenCalled();
			waitFor( () => {
				expect( getByTestId( 'hosting-overview-loading' ) ).toBeVisible();
			} );
		} );

		it( 'should not request the site details when the current site is being requested', () => {
			const initialState = {
				...mockCalypsoState,
				sites: {
					...mockCalypsoState.sites,
					requesting: {
						[ mockSiteId ]: true,
					},
				},
			};

			requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByTestId } = localRenderWithProvider( <HostingOverview />, { initialState } );

			expect( requestSiteSpy ).not.toHaveBeenCalled();
			expect( getByTestId( 'hosting-overview-loading' ) ).toBeVisible();
		} );

		it( 'should not request the site details when all sites are being requested', () => {
			const initialState = {
				...mockCalypsoState,
				sites: {
					...mockCalypsoState.sites,
					requestingAll: true,
				},
			};

			requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByTestId } = localRenderWithProvider( <HostingOverview />, { initialState } );

			expect( requestSiteSpy ).not.toHaveBeenCalled();
			expect( getByTestId( 'hosting-overview-loading' ) ).toBeVisible();
		} );
	} );
} );
