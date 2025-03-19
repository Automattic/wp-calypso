/**
 * @jest-environment jsdom
 */
import { MigrationStatus } from '@automattic/data-stores';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { createReduxStore } from 'calypso/state';
import { SITE_REQUEST, SITES_REQUEST, SELECTED_SITE_SET } from 'calypso/state/action-types';
import { setStore } from 'calypso/state/redux-store';
import * as siteActions from 'calypso/state/sites/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import HostingOverview from '../hosting-overview';
import type { SiteDetails } from '@automattic/data-stores';
import type { UnknownAction } from 'redux';

// Store original location so we can restore it after all tests.
const originalLocation = window.location;

type LocalRenderWithProviderOptions = {
	initialState?: Record< string, unknown >;
	additionalActions?: UnknownAction[];
};
const localRenderWithProvider = (
	element,
	{ initialState, additionalActions = [] }: LocalRenderWithProviderOptions
) => {
	const store = createReduxStore( initialState ?? {} );

	setStore( store );

	additionalActions.forEach( ( action ) => {
		store.dispatch( action );
	} );

	return renderWithProvider( element, { store } );
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
};

const mockRequestSiteAction: UnknownAction = {
	type: SITE_REQUEST,
	siteId: mockSiteId,
};

const mockRequestSitesAction: UnknownAction = {
	type: SITES_REQUEST,
};

const mockSetSelectedSiteIdAction: UnknownAction = {
	type: SELECTED_SITE_SET,
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

		it( 'should load the page and not request site details', async () => {
			const requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByText, queryByTestId } = localRenderWithProvider( <HostingOverview />, {
				initialState: mockCalypsoState,
				additionalActions: [ mockSetSelectedSiteIdAction ],
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();

			await waitFor( () => {
				// NavigationHeader
				expect( getByText( 'Overview' ) ).toBeVisible();
				// SiteBackupCard
				expect( getByText( 'Site backup' ) ).toBeVisible();
				// QuickActionsCard
				expect( getByText( 'Command Palette' ) ).toBeVisible();
				// SupportCard
				expect( getByText( 'Need some help?' ) ).toBeVisible();

				expect( queryByTestId( 'hosting-overview-loading' ) ).not.toBeInTheDocument();
			} );
		} );

		it( 'should not request the site details when refresh is present', async () => {
			window.location.search = '?refresh';

			const requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByText, queryByTestId } = localRenderWithProvider( <HostingOverview />, {
				initialState: mockCalypsoState,
				additionalActions: [ mockSetSelectedSiteIdAction ],
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();

			await waitFor( () => {
				// NavigationHeader
				expect( getByText( 'Overview' ) ).toBeVisible();
				// SiteBackupCard
				expect( getByText( 'Site backup' ) ).toBeVisible();
				// QuickActionsCard
				expect( getByText( 'Command Palette' ) ).toBeVisible();
				// SupportCard
				expect( getByText( 'Need some help?' ) ).toBeVisible();

				expect( queryByTestId( 'hosting-overview-loading' ) ).not.toBeInTheDocument();
			} );
		} );

		it( 'should load the page when the current site details are being requested', async () => {
			const initialState = {
				...mockCalypsoState,
				sites: {
					...mockCalypsoState.sites,
					requesting: {
						[ mockSiteId ]: true,
					},
				},
			};
			const additionalActions = [ mockSetSelectedSiteIdAction, mockRequestSiteAction ];

			const requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByText, queryByTestId } = localRenderWithProvider( <HostingOverview />, {
				initialState,
				additionalActions,
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();

			await waitFor( () => {
				// NavigationHeader
				expect( getByText( 'Overview' ) ).toBeVisible();
				// SiteBackupCard
				expect( getByText( 'Site backup' ) ).toBeVisible();
				// QuickActionsCard
				expect( getByText( 'Command Palette' ) ).toBeVisible();
				// SupportCard
				expect( getByText( 'Need some help?' ) ).toBeVisible();

				expect( queryByTestId( 'hosting-overview-loading' ) ).not.toBeInTheDocument();
			} );
		} );

		it( 'should load the page when all site details are being requested', async () => {
			const initialState = {
				...mockCalypsoState,
				sites: {
					...mockCalypsoState.sites,
					requestingAll: true,
				},
			};
			const additionalActions = [ mockRequestSitesAction ];

			const requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );

			const { getByText, queryByTestId } = localRenderWithProvider( <HostingOverview />, {
				initialState,
				additionalActions,
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();

			await waitFor( () => {
				// NavigationHeader
				expect( getByText( 'Overview' ) ).toBeVisible();
				// SiteBackupCard
				expect( getByText( 'Site backup' ) ).toBeVisible();
				// QuickActionsCard
				expect( getByText( 'Command Palette' ) ).toBeVisible();
				// SupportCard
				expect( getByText( 'Need some help?' ) ).toBeVisible();

				expect( queryByTestId( 'hosting-overview-loading' ) ).not.toBeInTheDocument();
			} );
		} );
	} );

	describe( 'when refresh parameter is true', () => {
		beforeEach( () => {
			window.location.search = '?refresh=true';
		} );

		it( 'should request the site details when no site data is being requested', async () => {
			const requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );
			requestSiteSpy.mockImplementation( () => {
				return mockRequestSiteAction;
			} );

			const { getByTestId } = localRenderWithProvider( <HostingOverview debug />, {
				initialState: mockCalypsoState,
				additionalActions: [ mockSetSelectedSiteIdAction ],
			} );

			await waitFor( () => {
				expect( requestSiteSpy ).toHaveBeenCalled();
				expect( getByTestId( 'hosting-overview-loading' ) ).toBeVisible();
			} );
		} );

		it( 'should not request the site details when the current site is being requested', () => {
			const requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );
			const additionalActions = [ mockSetSelectedSiteIdAction, mockRequestSiteAction ];

			const { getByTestId } = localRenderWithProvider( <HostingOverview />, {
				initialState: mockCalypsoState,
				additionalActions,
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();
			expect( getByTestId( 'hosting-overview-loading' ) ).toBeVisible();
		} );

		it( 'should not request the site details when all sites are being requested', () => {
			const requestSiteSpy = jest.spyOn( siteActions, 'requestSite' );
			const additionalActions = [ mockSetSelectedSiteIdAction, mockRequestSitesAction ];

			const { getByTestId } = localRenderWithProvider( <HostingOverview />, {
				initialState: mockCalypsoState,
				additionalActions,
			} );

			expect( requestSiteSpy ).not.toHaveBeenCalled();
			expect( getByTestId( 'hosting-overview-loading' ) ).toBeVisible();
		} );
	} );
} );
