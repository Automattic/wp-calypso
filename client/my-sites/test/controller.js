/**
 * External dependencies
 */
import page from 'page';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

/**
 * Internal dependencies
 */
import {
	updateRecentSitesPreferences,
	recordNoSitesPageView,
	recordNoVisibleSitesPageView,
	redirectToPrimary,
} from '../controller';
import * as pageView from 'calypso/lib/analytics/page-view';
import { PREFERENCES_SET } from 'calypso/state/action-types';

const middlewares = [ thunk ];
const mockStore = configureStore( middlewares );

describe( 'updateRecentSitesPreferences', () => {
	it( 'should do nothing if remote preferences are not available', () => {
		const initialState = {
			preferences: {
				remoteValues: null,
			},
		};
		const store = mockStore( initialState );

		updateRecentSitesPreferences( { store } );

		expect( store.getActions() ).toHaveLength( 0 );
	} );

	it( 'should not nothing if no site is selected', () => {
		const initialState = {
			preferences: {
				remoteValues: {},
			},
			ui: {
				selectedSiteId: null,
			},
		};
		const store = mockStore( initialState );

		updateRecentSitesPreferences( { store } );

		expect( store.getActions() ).toHaveLength( 0 );
	} );

	it( 'should not nothing if selected site is the most recent', () => {
		const selectedSiteId = 1;
		const initialState = {
			preferences: {
				remoteValues: {
					recentSites: [ selectedSiteId ],
				},
			},
			ui: {
				selectedSiteId,
			},
		};
		const store = mockStore( initialState );

		updateRecentSitesPreferences( { store } );

		expect( store.getActions() ).toHaveLength( 0 );
	} );

	it( 'should save the selected site as the most recent', () => {
		const selectedSiteId = 1;
		const initialState = {
			preferences: {
				remoteValues: {
					recentSites: [ selectedSiteId + 1 ],
				},
			},
			sites: {
				items: {
					[ selectedSiteId ]: {},
					[ selectedSiteId + 1 ]: {},
				},
			},
			ui: {
				selectedSiteId,
			},
		};
		const store = mockStore( initialState );

		updateRecentSitesPreferences( { store } );

		expect(
			store.getActions().find( ( { type } ) => type === PREFERENCES_SET )?.value[ 0 ]
		).toEqual( selectedSiteId );
	} );

	it( 'should limit the number of recent sites to 5', () => {
		const initialState = {
			preferences: {
				remoteValues: {
					recentSites: [ 2, 3, 4, 5, 6 ],
				},
			},
			sites: {
				items: {
					1: {},
					2: {},
					3: {},
					4: {},
					5: {},
					6: {},
				},
			},
			ui: {
				selectedSiteId: 1,
			},
		};
		const store = mockStore( initialState );

		updateRecentSitesPreferences( { store } );

		expect(
			store.getActions().find( ( { type } ) => type === PREFERENCES_SET )?.value
		).toHaveLength( 5 );
	} );

	it( 'should not save sites that are not available locally', () => {
		const selectedSiteId = 1;
		const initialState = {
			preferences: {
				remoteValues: {
					recentSites: [ selectedSiteId + 1 ],
				},
			},
			sites: {
				items: {
					[ selectedSiteId ]: {},
				},
			},
			ui: {
				selectedSiteId,
			},
		};
		const store = mockStore( initialState );

		updateRecentSitesPreferences( { store } );

		expect(
			store.getActions().find( ( { type } ) => type === PREFERENCES_SET )?.value
		).toHaveLength( 1 );
	} );
} );

describe( 'recordNoVisibleSitesPageView', () => {
	it( 'should record the page view', () => {
		const path = '/path';
		const siteFragment = 'site';
		const title = 'Title';

		pageView.recordPageView = jest.fn();

		recordNoVisibleSitesPageView( { path: `${ path }/${ siteFragment }` }, siteFragment, title );

		expect( pageView.recordPageView ).toHaveBeenCalledWith(
			`/no-sites`,
			expect.stringMatching( 'All Sites Hidden' ),
			{ base_path: path }
		);

		pageView.recordPageView.mockRestore();
	} );
} );

describe( 'recordNoSitesPageView', () => {
	it( 'should record the page view', () => {
		const path = '/path';
		const siteFragment = 'site';

		pageView.recordPageView = jest.fn();

		recordNoSitesPageView( { path: `${ path }/${ siteFragment }` }, siteFragment );

		expect( pageView.recordPageView ).toHaveBeenCalledWith(
			`/no-sites`,
			expect.stringMatching( 'No Sites' ),
			{ base_path: path }
		);

		pageView.recordPageView.mockRestore();
	} );
} );

describe( 'redirectToPrimary', () => {
	it( 'should redirect to section with the specified site', () => {
		const path = '/path';
		const siteFragment = 'site';
		const query = 'a=b';

		page.redirect = jest.fn();

		redirectToPrimary( { pathname: `${ path }/no-site`, querystring: query }, siteFragment );

		expect( page.redirect ).toHaveBeenCalledWith( `${ path }/site?${ query }` );

		page.redirect.mockRestore();
	} );
} );
