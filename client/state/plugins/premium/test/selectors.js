/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
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
		assert.equal( typeof selectors.isRequesting, 'function' );
	} );

	test( 'should contain isStarted method', () => {
		assert.equal( typeof selectors.isStarted, 'function' );
	} );

	test( 'should contain isFinished method', () => {
		assert.equal( typeof selectors.isFinished, 'function' );
	} );

	test( 'should contain getPluginsForSite method', () => {
		assert.equal( typeof selectors.getPluginsForSite, 'function' );
	} );

	test( 'should contain getActivePlugin method', () => {
		assert.equal( typeof selectors.getActivePlugin, 'function' );
	} );

	test( 'should contain getNextPlugin method', () => {
		assert.equal( typeof selectors.getNextPlugin, 'function' );
	} );

	describe( 'isRequesting', () => {
		test( 'Should get `true` if the requested site is not in the current state', () => {
			assert.equal( selectors.isRequesting( state, 'no.site' ), true );
		} );

		test( 'Should get `false` if the requested site is not being fetched', () => {
			assert.equal( selectors.isRequesting( state, 'finished.site' ), false );
		} );

		test( 'Should get `true` if the requested site is being fetched', () => {
			assert.equal( selectors.isRequesting( state, 'wait.site' ), true );
		} );
	} );

	describe( 'isStarted', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			assert.equal( selectors.isStarted( state, 'no.site' ), false );
		} );

		test( 'Should get `false` if there are no plugins installing on the requested site', () => {
			assert.equal( selectors.isStarted( state, 'start.site' ), false );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site', () => {
			assert.equal( selectors.isStarted( state, 'installing.site' ), true );
		} );

		test( 'Should get `true` if all plugins on the requested site are either done or have errors', () => {
			assert.equal( selectors.isStarted( state, 'finished.site' ), true );
		} );
	} );

	describe( 'isFinished', () => {
		test( 'Should get `true` if the requested site is not in the current state', () => {
			assert.equal( selectors.isFinished( state, 'no.site' ), true );
		} );

		test( 'Should get `false` if there is a plugin installing on the requested site', () => {
			assert.equal( selectors.isFinished( state, 'installing.site' ), false );
		} );

		test( 'Should get `true` if all plugins on the requested site are either done or have errors', () => {
			assert.equal( selectors.isFinished( state, 'finished.site' ), true );
		} );
	} );

	describe( 'isInstalling', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			assert.equal( selectors.isInstalling( state, 'no.site' ), false );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site', () => {
			assert.equal( selectors.isInstalling( state, 'installing.site' ), true );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site, using whitelist', () => {
			assert.equal( selectors.isInstalling( state, 'installing.site', 'akismet' ), true );
		} );

		test( 'Should get `true` if there is a plugin installing on the requested site, using whitelist', () => {
			assert.equal( selectors.isInstalling( state, 'config.site', 'akismet' ), true );
		} );

		test( 'Should get `false` if all plugins on the requested site are either done or have errors', () => {
			assert.equal( selectors.isInstalling( state, 'finished.site' ), false );
		} );
	} );

	describe( 'getPluginsForSite', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			assert.equal( selectors.getPluginsForSite( state, 'no.site' ), false );
		} );

		test( 'Should get the list of plugins if the site exists in the current state', () => {
			assert.equal( selectors.getPluginsForSite( state, 'start.site' ).length, 3 );
			assert.equal( selectors.getPluginsForSite( state, 'start.site' )[ 0 ].slug, 'vaultpress' );
			assert.equal( selectors.getPluginsForSite( state, 'start.site' )[ 1 ].slug, 'akismet' );
			assert.equal( selectors.getPluginsForSite( state, 'start.site' )[ 2 ].slug, 'polldaddy' );
		} );
	} );

	describe( 'getActivePlugin', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			assert.equal( selectors.getActivePlugin( state, 'no.site' ), false );
		} );

		test( 'Should get `false` if no plugins on the requested site are currently being installed', () => {
			assert.equal( selectors.getActivePlugin( state, 'start.site' ), false );
		} );

		test( 'Should get `false` if all plugins on the requested site are finished installing', () => {
			assert.equal( selectors.getActivePlugin( state, 'finished.site' ), false );
		} );

		test( 'Should get `akismet` if akismet is the currently being installed on the requested site', () => {
			assert.equal( selectors.getActivePlugin( state, 'installing.site' ).slug, 'akismet' );
		} );
	} );

	describe( 'getNextPlugin', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			assert.equal( selectors.getNextPlugin( state, 'no.site' ), false );
		} );

		test( "Should get the first plugin in the list if the requested site hasn't started yet", () => {
			assert.equal( selectors.getNextPlugin( state, 'start.site' ).slug, 'vaultpress' );
		} );

		test( 'Should get `polldaddy`, next in the list, if the requested site is installing akismet', () => {
			assert.equal( selectors.getNextPlugin( state, 'installing.site' ).slug, 'polldaddy' );
		} );

		test( 'Should get `false`, if the requested site is finished installing all plugins', () => {
			assert.equal( selectors.getNextPlugin( state, 'finished.site' ), false );
		} );
	} );
} );
