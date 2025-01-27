/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import * as pageView from 'calypso/lib/analytics/page-view';
import { PREFERENCES_SET } from 'calypso/state/action-types';
import {
	updateRecentSitesPreferences,
	recordNoSitesPageView,
	recordNoVisibleSitesPageView,
	redirectToPrimary,
} from '../controller';

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
