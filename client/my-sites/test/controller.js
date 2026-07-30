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
	const siteId = 1;
	const siteFragment = 'example.com';

	// A mock store never reduces the `setSelectedSiteId` this dispatches, so
	// `selectedSiteId` stands in for the state after it.
	const buildStore = ( items, selectedSiteId = null ) =>
		mockStore( {
			currentUser: { user: { site_count: 2, visible_site_count: 2 } },
			sites: { items, domains: { items: {} }, plans: {} },
			ui: { selectedSiteId },
			preferences: { remoteValues: null },
		} );

	const buildContext = ( store ) => ( {
		store,
		path: `/home/${ siteFragment }`,
		pathname: `/home/${ siteFragment }`,
		params: { site: siteFragment },
		query: {},
		querystring: '',
		section: { enableNoSites: false },
	} );

	const selectedSiteAction = ( store ) =>
		store.getActions().find( ( { type } ) => type === SELECTED_SITE_SET );

	let redirectSpy;
	let next;

	beforeEach( () => {
		redirectSpy = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
		next = jest.fn();
	} );

	afterEach( () => {
		redirectSpy.mockRestore();
	} );

	it( 'should not select a fetched site that is absent from state', async () => {
		requestSite.mockReturnValue( () => Promise.resolve( { ID: 2, URL: 'https://example.com' } ) );
		const store = buildStore( { [ siteId ]: {} } );

		siteSelection( buildContext( store ), next );
		await new Promise( process.nextTick );

		expect( selectedSiteAction( store ) ).toBeUndefined();
		expect( next ).not.toHaveBeenCalled();
		expect( redirectSpy ).toHaveBeenCalledWith( '/home' );
	} );

	it( 'should select a fetched site that is in state under a different slug', async () => {
		requestSite.mockReturnValue( () =>
			Promise.resolve( { ID: siteId, URL: 'https://example.wordpress.com' } )
		);
		const store = buildStore(
			{
				[ siteId ]: {
					ID: siteId,
					URL: 'https://example.wordpress.com',
					capabilities: { manage_options: true },
					options: { unmapped_url: 'https://example.wordpress.com' },
				},
			},
			siteId
		);

		siteSelection( buildContext( store ), next );
		await new Promise( process.nextTick );

		expect( selectedSiteAction( store )?.siteId ).toEqual( siteId );
		expect( redirectSpy ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
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
