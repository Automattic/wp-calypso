/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import * as pageView from 'calypso/lib/analytics/page-view';
import { PREFERENCES_SET, SELECTED_SITE_SET } from 'calypso/state/action-types';
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
	const USER_ID = 7;

	// Total number of requests once every retry has been used up: the initial one plus the retries.
	const REQUESTS_WHEN_EXHAUSTED = 4;
	const LONGER_THAN_THE_WHOLE_BACKOFF = 60000;

	// A site the current user can't manage yet is kept out of the state by `requestSite`, even
	// though the API returns it. See the `capabilities` guard in `state/sites/actions`.
	const unmanageableSiteState = {
		currentUser: { id: USER_ID, user: { site_count: 2, visible_site_count: 2 }, capabilities: {} },
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

	// The `/me/sites` bootstrap saw the user as an admin of the site, so missing capabilities on
	// the site response are propagation lag rather than a lack of access.
	const wasAdminState = {
		...unmanageableSiteState,
		currentUser: {
			...unmanageableSiteState.currentUser,
			capabilities: { [ SITE_ID ]: { manage_options: true } },
		},
	};

	function respondWithSite( site ) {
		requestSite.mockReturnValue( () => Promise.resolve( { ID: SITE_ID, ...site } ) );
	}

	function selectSite( getState, overrides ) {
		const next = jest.fn();
		const context = {
			store: mockStore( getState ),
			path: `/home/${ SITE_SLUG }`,
			pathname: `/home/${ SITE_SLUG }`,
			params: { site: SITE_SLUG },
			query: {},
			section: {},
			...overrides,
		};

		page.current = context.path;
		siteSelection( context, next );

		return { next, context };
	}

	beforeEach( () => {
		jest.useFakeTimers();
		requestSite.mockReset();
		respondWithSite( { site_owner: USER_ID } );
		// page.js builds a Context that reaches for the document, which this environment lacks.
		jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.useRealTimers();
		jest.restoreAllMocks();
		page.current = '';
	} );

	it( 'should retry when the current user owns a site that is not manageable yet', async () => {
		let state = unmanageableSiteState;
		const { next, context } = selectSite( () => state );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( requestSite ).toHaveBeenCalledTimes( 1 );
		expect( next ).not.toHaveBeenCalled();
		// Nothing is rendered while we wait, so the page the user is on stays put.
		expect( context.primary ).toBeUndefined();

		// Capabilities propagate, so the retry lands the site in the state.
		state = manageableSiteState;
		await jest.advanceTimersByTimeAsync( 1000 );

		expect( requestSite ).toHaveBeenCalledTimes( 2 );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should retry when the current user was an admin of the site', async () => {
		respondWithSite( { site_owner: USER_ID + 1 } );

		let state = wasAdminState;
		const { next } = selectSite( () => state );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( requestSite ).toHaveBeenCalledTimes( 1 );

		state = manageableSiteState;
		await jest.advanceTimersByTimeAsync( 1000 );

		expect( requestSite ).toHaveBeenCalledTimes( 2 );
		expect( next ).toHaveBeenCalled();
	} );

	it( 'should not retry when nothing suggests the user has access to the site', async () => {
		respondWithSite( { site_owner: USER_ID + 1 } );

		const { next } = selectSite( () => unmanageableSiteState );

		await jest.advanceTimersByTimeAsync( LONGER_THAN_THE_WHOLE_BACKOFF );

		expect( requestSite ).toHaveBeenCalledTimes( 1 );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'should not retry an unlinked checkout, which ignores the site it finds', async () => {
		const checkoutPath = `/checkout/${ SITE_SLUG }/jetpack_security_t1_yearly`;
		const { next } = selectSite( () => unmanageableSiteState, {
			path: checkoutPath,
			pathname: checkoutPath,
			query: { unlinked: '1' },
		} );

		await jest.advanceTimersByTimeAsync( LONGER_THAN_THE_WHOLE_BACKOFF );

		expect( requestSite ).toHaveBeenCalledTimes( 1 );
		expect( next ).not.toHaveBeenCalled();
		// It settled on its redirect straight away instead of waiting out the backoff.
		expect( page.redirect ).toHaveBeenCalled();
	} );

	it( 'should give up retrying once the backoff is exhausted', async () => {
		const { next } = selectSite( () => unmanageableSiteState );

		await jest.advanceTimersByTimeAsync( LONGER_THAN_THE_WHOLE_BACKOFF );

		expect( requestSite ).toHaveBeenCalledTimes( REQUESTS_WHEN_EXHAUSTED );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'should stop retrying when the user navigates away', async () => {
		const { next } = selectSite( () => unmanageableSiteState );

		await jest.advanceTimersByTimeAsync( 0 );
		page.current = '/reader';
		await jest.advanceTimersByTimeAsync( LONGER_THAN_THE_WHOLE_BACKOFF );

		expect( requestSite ).toHaveBeenCalledTimes( 1 );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'should not select the site when the user navigates away mid-request', async () => {
		let state = unmanageableSiteState;
		const { next, context } = selectSite( () => state );

		// The in-flight request comes back with a perfectly selectable site.
		state = manageableSiteState;
		page.current = '/reader';
		await jest.advanceTimersByTimeAsync( LONGER_THAN_THE_WHOLE_BACKOFF );

		expect( next ).not.toHaveBeenCalled();
		expect( context.store.getActions() ).toEqual( [] );
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

describe( 'siteSelection — site fetch failure fallback', () => {
	// Flush only the microtask queue (the middleware's promise chain), never a macrotask.
	// `page.redirect` schedules its real `page.replace` on a timer; pumping setTimeout here
	// would let that leaked navigation fire and tear down the jsdom document mid-test.
	const flushPromises = async () => {
		for ( let i = 0; i < 10; i++ ) {
			await Promise.resolve();
		}
	};

	// Simulates a fresh page load where the site fetch fails: the store has no
	// matching site (empty `sites.items`, so `getSiteId` returns null) and
	// requestSite rejects, so `freshSiteId` ends up falsy and the middleware
	// reaches its fallback branch.
	const buildContext = ( { path, pathname, querystring, siteFragment, selectedSiteId = null } ) => {
		const store = mockStore( {
			currentUser: { id: 12345, user: { site_count: 3, visible_site_count: 2 } },
			sites: { items: {} },
			ui: { selectedSiteId },
		} );
		const context = {
			store,
			params: { site: siteFragment },
			path,
			pathname,
			querystring,
			query: {},
			section: { enableNoSites: false },
		};
		// The fetch callback bails out early if the user has navigated away, so
		// pin the current route to this context's path.
		page.current = context.path;
		return context;
	};

	let redirect;

	beforeEach( () => {
		requestSite.mockReturnValue( () =>
			Promise.reject( new Error( 'intermittent site fetch failure' ) )
		);
		redirect = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		// `page.redirect` schedules a real `page.replace` on a timer; neutralize it so a
		// leaked navigation cannot tear down the jsdom document while promises flush.
		jest.spyOn( page, 'replace' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
		page.current = '';
	} );

	it( 'does not strip the site slug on a checkout renewal URL when the site fetch fails', async () => {
		const siteFragment = 'ecommercesite.wpcomstaging.com';
		const pathname = `/checkout/ecommerce-bundle/renew/1252758/${ siteFragment }`;
		const querystring = 'cancel_to=%2Fplans&redirect_to=%2Fplans';
		const context = buildContext( {
			path: `${ pathname }?${ querystring }`,
			pathname,
			querystring,
			siteFragment,
		} );
		const next = jest.fn();

		siteSelection( context, next );
		await flushPromises();

		expect( redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'clears a stale selectedSiteId before rendering checkout when the site fetch fails', async () => {
		const siteFragment = 'ecommercesite.wpcomstaging.com';
		const pathname = `/checkout/ecommerce-bundle/renew/1252758/${ siteFragment }`;
		const querystring = 'cancel_to=%2Fplans&redirect_to=%2Fplans';
		const context = buildContext( {
			path: `${ pathname }?${ querystring }`,
			pathname,
			querystring,
			siteFragment,
			// A prior SPA navigation left an unrelated site selected.
			selectedSiteId: 999,
		} );
		const next = jest.fn();

		siteSelection( context, next );
		await flushPromises();

		expect( context.store.getActions() ).toContainEqual( {
			type: SELECTED_SITE_SET,
			siteId: null,
		} );
		expect( redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'redirects to the slug-less all-sites path on a non-checkout route when the site fetch fails', async () => {
		const siteFragment = 'ecommercesite.wpcomstaging.com';
		const pathname = `/stats/day/${ siteFragment }`;
		const querystring = 'a=b';
		const context = buildContext( {
			path: `${ pathname }?${ querystring }`,
			pathname,
			querystring,
			siteFragment,
		} );
		const next = jest.fn();

		siteSelection( context, next );
		await flushPromises();

		expect( redirect ).toHaveBeenCalledWith( `/stats/day?${ querystring }` );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
