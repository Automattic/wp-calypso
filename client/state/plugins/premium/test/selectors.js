/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getActivePlugin,
	getNextPlugin,
	getPluginKeys,
	getPluginsForSite,
	isFinished,
	isInstalling,
	isRequesting,
	isStarted,
} from '../selectors';
import { initSite, installingSite, finishedSite, configuringSite } from './examples';

const state = deepFreeze( {
	plugins: {
		premium: {
			isRequesting: {
				'finished.site': false,
				'wait.site': true,
			},
			plugins: {
				'start.site': initSite,
				'installing.site': installingSite,
				'finished.site': finishedSite,
				'config.site': configuringSite,
			},
		},
	},
} );

describe( 'Premium Plugin Selectors', () => {
	describe( 'isRequesting', () => {
		test( 'Should get `true` if the requested site is not in the current state', () => {
			expect( isRequesting( state, 'no.site' ) ).toBe( true );
		} );

		test( 'Should get `false` if the requested site is not being fetched', () => {
			expect( isRequesting( state, 'finished.site' ) ).toBe( false );
		} );

		test( 'Should get `true` if the requested site is being fetched', () => {
			expect( isRequesting( state, 'wait.site' ) ).toBe( true );
		} );
	} );

	describe( 'isStarted', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( isStarted( state, 'no.site' ) ).toBe( false );
		} );

		test( 'Should get `false` if there are no plugins installing on the requested site', () => {
			expect( isStarted( state, 'start.site' ) ).toBe( false );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site', () => {
			expect( isStarted( state, 'installing.site' ) ).toBe( true );
		} );

		test( 'Should get `true` if all plugins on the requested site are either done or have errors', () => {
			expect( isStarted( state, 'finished.site' ) ).toBe( true );
		} );
	} );

	describe( 'isFinished', () => {
		test( 'Should get `true` if the requested site is not in the current state', () => {
			expect( isFinished( state, 'no.site' ) ).toBe( true );
		} );

		test( 'Should get `false` if there is a plugin installing on the requested site', () => {
			expect( isFinished( state, 'installing.site' ) ).toBe( false );
		} );

		test( 'Should get `true` if all plugins on the requested site are either done or have errors', () => {
			expect( isFinished( state, 'finished.site' ) ).toBe( true );
		} );
	} );

	describe( 'isInstalling', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( isInstalling( state, 'no.site' ) ).toBe( false );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site', () => {
			expect( isInstalling( state, 'installing.site' ) ).toBe( true );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site, using whitelist', () => {
			expect( isInstalling( state, 'installing.site', 'akismet' ) ).toBe( true );
		} );

		test( 'Should get `true` if there is a plugin configuring on the requested site, using whitelist', () => {
			expect( isInstalling( state, 'config.site', 'akismet' ) ).toBe( true );
		} );

		test( 'Should get `false` if all plugins on the requested site are either done or have errors', () => {
			expect( isInstalling( state, 'finished.site' ) ).toBe( false );
		} );
	} );

	describe( 'getPluginsForSite', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			expect( getPluginsForSite( state, 'no.site' ) ).toEqual( [] );
		} );

		test( 'Should get the list of plugins if the site exists in the current state', () => {
			expect( getPluginsForSite( state, 'start.site' ) ).toHaveLength( 3 );
			expect( getPluginsForSite( state, 'start.site' )[ 0 ].slug ).toBe( 'vaultpress' );
			expect( getPluginsForSite( state, 'start.site' )[ 1 ].slug ).toBe( 'akismet' );
			expect( getPluginsForSite( state, 'start.site' )[ 2 ].slug ).toBe( 'polldaddy' );
		} );
	} );

	describe( 'getActivePlugin', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( getActivePlugin( state, 'no.site' ) ).toBe( false );
		} );

		test( 'Should get `false` if no plugins on the requested site are currently being installed', () => {
			expect( getActivePlugin( state, 'start.site' ) ).toBe( false );
		} );

		test( 'Should get `false` if all plugins on the requested site are finished installing', () => {
			expect( getActivePlugin( state, 'finished.site' ) ).toBe( false );
		} );

		test( 'Should get `akismet` if akismet is the currently being installed on the requested site', () => {
			expect( getActivePlugin( state, 'installing.site' ).slug ).toBe( 'akismet' );
		} );
	} );

	describe( 'getNextPlugin', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( getNextPlugin( state, 'no.site' ) ).toBe( false );
		} );

		test( "Should get the first plugin in the list if the requested site hasn't started yet", () => {
			expect( getNextPlugin( state, 'start.site' ).slug ).toBe( 'vaultpress' );
		} );

		test( 'Should get `polldaddy`, next in the list, if the requested site is installing akismet', () => {
			expect( getNextPlugin( state, 'installing.site' ).slug ).toBe( 'polldaddy' );
		} );

		test( 'Should get `false`, if the requested site is finished installing all plugins', () => {
			expect( getNextPlugin( state, 'finished.site' ) ).toBe( false );
		} );
	} );

	describe( 'getPluginKeys', () => {
		test( 'Should get an empty object if there are no plugins for this site', () => {
			expect( getPluginKeys( state, 'no.site' ) ).toEqual( {} );
		} );

		test( 'Should get plugin keys if there are plugins for this site', () => {
			expect( getPluginKeys( state, 'start.site' ) ).toEqual( {
				akismet: 'ak-api-key',
				polldaddy: 'pd-api-key',
				vaultpress: 'vp-api-key',
			} );
		} );

		test( 'Should get the same object for the identical calls', () => {
			const keys1 = getPluginKeys( state, 'start.site' );
			const keys2 = getPluginKeys( state, 'start.site' );
			expect( keys1 ).toBe( keys2 );
		} );
	} );
} );
