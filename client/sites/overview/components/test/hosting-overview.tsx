/**
 * @jest-environment jsdom
 */
import { MigrationStatus } from '@automattic/data-stores';
import React from 'react';
import {
	PURCHASES_SITE_FETCH,
	SITE_REQUEST,
	SITES_REQUEST,
	SELECTED_SITE_SET,
} from 'calypso/state/action-types';
import {
	renderWithProvider,
	statefulRenderWithProvider,
} from 'calypso/test-helpers/testing-library';
import HostingOverview from '../hosting-overview';
import type { SiteDetails } from '@automattic/data-stores';
import type { UnknownAction } from 'redux';

type MockSiteOptions = {
	mockSiteId: number;
	is_wpcom_atomic?: boolean;
	migrationStatus?: MigrationStatus;
	migrationSticker?: string;
};

const buildMockSite = ( {
	mockSiteId,
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

describe( 'HostingOverview', () => {
	const mockSiteId = 123;

	const mockRequestSite: UnknownAction = {
		type: SITE_REQUEST,
		siteId: mockSiteId,
	};

	const mockRequestSites: UnknownAction = {
		type: SITES_REQUEST,
	};

	const mockSetSelectedSite: UnknownAction = {
		type: SELECTED_SITE_SET,
		siteId: mockSiteId,
	};

	const mockInitialState = {
		currentUser: {
			capabilities: {},
			flags: [],
		},
		sites: {
			items: {
				[ mockSiteId ]: buildMockSite( { mockSiteId } ),
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

	it( 'should trigger errors due to limited state tree population', async () => {
		expect( () => renderWithProvider( <HostingOverview /> ) ).toThrow();
	} );

	it( 'should work using the stateful provider', async () => {
		expect( () => statefulRenderWithProvider( <HostingOverview /> ) ).not.toThrow();
	} );

	it( 'should handle the site being fetched using the stateful provider', async () => {
		const additionalActions: UnknownAction[] = [ mockSetSelectedSite, mockRequestSite ];
		expect( () =>
			statefulRenderWithProvider( <HostingOverview />, {
				initialState: mockInitialState,
				additionalActions,
			} )
		).not.toThrow();
		// In a real-world test, we'd want to confirm that the code correctly triggered (or not) specific
		// actions as a result of the loading state
	} );

	it( 'should handle all sites being fetched using the stateful provider', async () => {
		const additionalActions: UnknownAction[] = [ mockSetSelectedSite, mockRequestSites ];
		expect( () =>
			statefulRenderWithProvider( <HostingOverview />, {
				initialState: mockInitialState,
				additionalActions,
			} )
		).not.toThrow();
	} );

	it( 'should handle an additional action for the secondary purchases reducer via the stateful provider', async () => {
		const mockSitePurchaseFetch: UnknownAction = {
			type: PURCHASES_SITE_FETCH,
			siteId: mockSiteId,
		};
		// Note that we need the secondary reducers to be pulled in for the purchases action to be handled.
		// I haven't tested that this actually works, but the goal of the additional actions is to get
		// the Redux state into a specific starting state.
		const additionalActions: UnknownAction[] = [
			mockSetSelectedSite,
			mockRequestSites,
			mockSitePurchaseFetch,
		];
		expect( () =>
			statefulRenderWithProvider( <HostingOverview />, {
				initialState: mockInitialState,
				additionalActions,
			} )
		).not.toThrow();
	} );

	it( 'should show a warning and ignore initial state from secondary reducers', async () => {
		expect( () =>
			statefulRenderWithProvider( <HostingOverview />, {
				initialState: {
					...mockInitialState,
					purchases: {},
				},
			} )
		).not.toThrow();
	} );
} );
