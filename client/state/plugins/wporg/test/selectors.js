/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getPlugin,
	isFetching,
	isFetched
} from '../selectors';

const state = deepFreeze( {
	plugins: {
		wporg: {
			fetchingItems: {
				test: false,
				fetchingTest: true,
				fetchedTest: false,
				fetchedTest2: true
			},
			items: {
				test: { slug: 'test' },
				fetchingTest: { slug: 'fetchingTest' },
				fetchedTest: { slug: 'fetchingTest', fetched: true },
				fetchedTest2: { slug: 'fetchingTest', fetched: true },
			},
		}
	}
} );

describe( 'WPorg Selectors', function() {
	it( 'Should contain getPlugin method', function() {
		assert.equal( typeof getPlugin, 'function' );
	} );

	it( 'Should contain isFetching method', function() {
		assert.equal( typeof isFetching, 'function' );
	} );

	it( 'Should contain isFetched method', function() {
		assert.equal( typeof isFetched, 'function' );
	} );

	describe( 'getPlugin', function() {
		it( 'Should get null if the requested plugin is not in the current state', function() {
			assert.equal( getPlugin( state, 'no-test' ), null );
		} );

		it( 'Should get the plugin if the requested plugin is in the current state', function() {
			assert.equal( getPlugin( state, 'test' ).slug, 'test' );
		} );

		it( 'Should return a new object with no pointers to the one stored in state', function() {
			const plugin = getPlugin( state, 'fetchedTest' );
			plugin.fetched = false;
			assert.equal( getPlugin( state, 'fetchedTest' ).fetched, true );
		} );

		// Used by components with flux stores, see `addWporgDataToPlugins` in `client/my-sites/plugins/main.jsx`)
		it( 'Should get the plugin from the items substate', function() {
			assert.equal( getPlugin( state.plugins.wporg.items, 'test' ).slug, 'test' );
		} );
	} );

	describe( 'isFetching', function() {
		it( 'Should get `true` if the requested plugin is not in the current state', function() {
			assert.equal( isFetching( state, 'no.test' ), true );
		} );

		it( 'Should get `false` if the requested plugin is not being fetched', function() {
			assert.equal( isFetching( state, 'test' ), false );
		} );

		it( 'Should get `true` if the requested plugin is being fetched', function() {
			assert.equal( isFetching( state, 'fetchingTest' ), true );
		} );
	} );

	describe( 'isFetched', function() {
		it( 'Should get `false` if the requested plugin is not in the current state', function() {
			assert.equal( isFetched( state, 'no.test' ), false );
		} );

		it( 'Should get `false` if the requested plugin has not being fetched', function() {
			assert.equal( isFetched( state, 'test' ), false );
		} );

		it( 'Should get `true` if the requested plugin has being fetched', function() {
			assert.equal( isFetched( state, 'fetchedTest' ), true );
		} );

		it( 'Should get `true` if the requested plugin has being fetched even if it\'s being fetche again', function() {
			assert.equal( isFetched( state, 'fetchedTest2' ), true );
		} );
	} );
} );
