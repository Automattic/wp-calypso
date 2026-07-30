/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import * as pageView from 'calypso/lib/analytics/page-view';
import { PREFERENCES_SET } from 'calypso/state/action-types';
import { requestSite } from 'calypso/state/sites/actions';
import {
	updateRecentSitesPreferences,
	recordNoSitesPageView,
	recordNoVisibleSitesPageView,
	redirectToPrimary,
	siteSelection,
} from '../controller';

jest.mock( 'calypso/state/sites/actions', () => ( {
	...jest.requireActual( 'calypso/state/sites/actions' ),
	requestSite: jest.fn(),
} ) );

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

	it( 'should do nothing if no site is selected', () => {
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

	it( 'should do nothing if selected site is the most recent', () => {
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
		const spy = jest.spyOn( pageView, 'recordPageView' );

		recordNoVisibleSitesPageView( { path: `${ path }/${ siteFragment }` }, siteFragment, title );

		expect( spy ).toHaveBeenCalledWith( `/no-sites`, expect.stringMatching( 'All Sites Hidden' ), {
			base_path: path,
		} );

		spy.mockRestore();
	} );
} );

describe( 'recordNoSitesPageView', () => {
	it( 'should record the page view', () => {
		const path = '/path';
		const siteFragment = 'site';
		const spy = jest.spyOn( pageView, 'recordPageView' );

		recordNoSitesPageView( { path: `${ path }/${ siteFragment }` }, siteFragment );

		expect( spy ).toHaveBeenCalledWith( `/no-sites`, expect.stringMatching( 'No Sites' ), {
			base_path: path,
		} );

		spy.mockRestore();
	} );
} );

describe( 'siteSelection', () => {
	const SITE_ID = 1;
	const SITE_SLUG = 'example.com';

	// A site the current user can't manage yet is kept out of the state by `requestSite`, even
	// though the API returns it. See the `capabilities` guard in `state/sites/actions`.
	const unmanageableSiteState = {
		currentUser: { user: { site_count: 2, visible_site_count: 2 } },
		preferences: { remoteValues: {} },
		sites: { items: {}, domains: { items: {} } },
		ui: { selectedSiteId: null },
	};

	const manageableSiteState = {
		...unmanageableSiteState,
		sites: {
			...unmanageableSiteState.sites,
			items: { [ SITE_ID ]: { ID: SITE_ID, URL: `https://${ SITE_SLUG }` } },
		},
		ui: { selectedSiteId: SITE_ID },
	};

	function selectSite( getState ) {
		const next = jest.fn();
		const context = {
			store: mockStore( getState ),
			path: `/home/${ SITE_SLUG }`,
			pathname: `/home/${ SITE_SLUG }`,
			params: { site: SITE_SLUG },
			query: {},
			section: {},
		};

		page.current = context.path;
		siteSelection( context, next );

		return next;
	}

	beforeEach( () => {
		jest.useFakeTimers();
		requestSite.mockReset();
		requestSite.mockReturnValue( () => Promise.resolve( { ID: SITE_ID } ) );
	} );

	afterEach( () => {
		jest.useRealTimers();
		page.current = '';
	} );

	it( 'should retry when the site is returned by the API but is not manageable yet', async () => {
		let state = unmanageableSiteState;
		const next = selectSite( () => state );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( requestSite ).toHaveBeenCalledTimes( 1 );
		expect( next ).not.toHaveBeenCalled();

		// Capabilities propagate, so the retry lands the site in the state.
		state = manageableSiteState;
		await jest.advanceTimersByTimeAsync( 2000 );

		expect( requestSite ).toHaveBeenCalledTimes( 2 );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should give up retrying once the limit is reached', async () => {
		const next = selectSite( () => unmanageableSiteState );

		await jest.advanceTimersByTimeAsync( 10000 );

		expect( requestSite ).toHaveBeenCalledTimes( 3 );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'should stop retrying when the user navigates away', async () => {
		const next = selectSite( () => unmanageableSiteState );

		await jest.advanceTimersByTimeAsync( 0 );
		page.current = '/reader';
		await jest.advanceTimersByTimeAsync( 10000 );

		expect( requestSite ).toHaveBeenCalledTimes( 1 );
		expect( next ).not.toHaveBeenCalled();
	} );
} );

describe( 'redirectToPrimary', () => {
	it( 'should redirect to section with the specified site', () => {
		const path = '/path';
		const siteFragment = 'site';
		const query = 'a=b';
		const spy = jest.spyOn( page, 'redirect' );

		redirectToPrimary( { pathname: `${ path }/no-site`, querystring: query }, siteFragment );

		expect( spy ).toHaveBeenCalledWith( `${ path }/site?${ query }` );

		spy.mockRestore();
	} );
} );
