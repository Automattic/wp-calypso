/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import selectors from '../selectors';
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
	test( 'should contain isRequesting method', () => {
		expect( typeof selectors.isRequesting ).toEqual( 'function' );
	} );

	test( 'should contain isStarted method', () => {
		expect( typeof selectors.isStarted ).toEqual( 'function' );
	} );

	test( 'should contain isFinished method', () => {
		expect( typeof selectors.isFinished ).toEqual( 'function' );
	} );

	test( 'should contain getPluginsForSite method', () => {
		expect( typeof selectors.getPluginsForSite ).toEqual( 'function' );
	} );

	test( 'should contain getActivePlugin method', () => {
		expect( typeof selectors.getActivePlugin ).toEqual( 'function' );
	} );

	test( 'should contain getNextPlugin method', () => {
		expect( typeof selectors.getNextPlugin ).toEqual( 'function' );
	} );

	describe( 'isRequesting', () => {
		test( 'Should get `true` if the requested site is not in the current state', () => {
			expect( selectors.isRequesting( state, 'no.site' ) ).toEqual( true );
		} );

		test( 'Should get `false` if the requested site is not being fetched', () => {
			expect( selectors.isRequesting( state, 'finished.site' ) ).toEqual( false );
		} );

		test( 'Should get `true` if the requested site is being fetched', () => {
			expect( selectors.isRequesting( state, 'wait.site' ) ).toEqual( true );
		} );
	} );

	describe( 'isStarted', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( selectors.isStarted( state, 'no.site' ) ).toEqual( false );
		} );

		test( 'Should get `false` if there are no plugins installing on the requested site', () => {
			expect( selectors.isStarted( state, 'start.site' ) ).toEqual( false );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site', () => {
			expect( selectors.isStarted( state, 'installing.site' ) ).toEqual( true );
		} );

		test( 'Should get `true` if all plugins on the requested site are either done or have errors', () => {
			expect( selectors.isStarted( state, 'finished.site' ) ).toEqual( true );
		} );
	} );

	describe( 'isFinished', () => {
		test( 'Should get `true` if the requested site is not in the current state', () => {
			expect( selectors.isFinished( state, 'no.site' ) ).toEqual( true );
		} );

		test( 'Should get `false` if there is a plugin installing on the requested site', () => {
			expect( selectors.isFinished( state, 'installing.site' ) ).toEqual( false );
		} );

		test( 'Should get `true` if all plugins on the requested site are either done or have errors', () => {
			expect( selectors.isFinished( state, 'finished.site' ) ).toEqual( true );
		} );
	} );

	describe( 'isInstalling', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( selectors.isInstalling( state, 'no.site' ) ).toEqual( false );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site', () => {
			expect( selectors.isInstalling( state, 'installing.site' ) ).toEqual( true );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site, using whitelist', () => {
			expect( selectors.isInstalling( state, 'installing.site', 'akismet' ) ).toEqual( true );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site, using whitelist', () => {
			expect( selectors.isInstalling( state, 'config.site', 'akismet' ) ).toEqual( true );
		} );

		test( 'Should get `false` if all plugins on the requested site are either done or have errors', () => {
			expect( selectors.isInstalling( state, 'finished.site' ) ).toEqual( false );
		} );
	} );

	describe( 'getPluginsForSite', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( selectors.getPluginsForSite( state, 'no.site' ) ).toEqual( false );
		} );

		test( 'Should get the list of plugins if the site exists in the current state', () => {
			expect( selectors.getPluginsForSite( state, 'start.site' ).length ).toEqual( 3 );
			expect( selectors.getPluginsForSite( state, 'start.site' )[ 0 ].slug ).toEqual(
				'vaultpress'
			);
			expect( selectors.getPluginsForSite( state, 'start.site' )[ 1 ].slug ).toEqual( 'akismet' );
			expect( selectors.getPluginsForSite( state, 'start.site' )[ 2 ].slug ).toEqual( 'polldaddy' );
		} );
	} );

	describe( 'getActivePlugin', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( selectors.getActivePlugin( state, 'no.site' ) ).toEqual( false );
		} );

		test( 'Should get `false` if no plugins on the requested site are currently being installed', () => {
			expect( selectors.getActivePlugin( state, 'start.site' ) ).toEqual( false );
		} );

		test( 'Should get `false` if all plugins on the requested site are finished installing', () => {
			expect( selectors.getActivePlugin( state, 'finished.site' ) ).toEqual( false );
		} );

		test( 'Should get `akismet` if akismet is the currently being installed on the requested site', () => {
			expect( selectors.getActivePlugin( state, 'installing.site' ).slug ).toEqual( 'akismet' );
		} );
	} );

	describe( 'getNextPlugin', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( selectors.getNextPlugin( state, 'no.site' ) ).toEqual( false );
		} );

		test( "Should get the first plugin in the list if the requested site hasn't started yet", () => {
			expect( selectors.getNextPlugin( state, 'start.site' ).slug ).toEqual( 'vaultpress' );
		} );

		test( 'Should get `polldaddy`, next in the list, if the requested site is installing akismet', () => {
			expect( selectors.getNextPlugin( state, 'installing.site' ).slug ).toEqual( 'polldaddy' );
		} );

		test( 'Should get `false`, if the requested site is finished installing all plugins', () => {
			expect( selectors.getNextPlugin( state, 'finished.site' ) ).toEqual( false );
		} );
	} );
} );
