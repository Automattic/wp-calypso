/**
 * External dependencies
 */
import { assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import selectors from '../selectors';

const items = deepFreeze( {
	test: { slug: 'test' },
	fetchingTest: { slug: 'fetchingTest' },
	fetchedTest: { slug: 'fetchingTest', fetched: true },
	fetchedTest2: { slug: 'fetchingTest', fetched: true }
} );
const fetchingItems = deepFreeze( {
	test: false,
	fetchingTest: true,
	fetchedTest: false,
	fetchedTest2: true
} );

describe( 'WPorg Selectors', function() {
	it( 'Should contain getPlugin method', function() {
		assert.equal( typeof selectors.getPlugin, 'function' );
	} );

	it( 'Should contain isFetching method', function() {
		assert.equal( typeof selectors.isFetching, 'function' );
	} );

	describe( 'getPlugin', function() {
		it( 'Should get null if the requested plugin is not in the current state', function() {
			assert.equal( selectors.getPlugin( items, 'no-test' ), null );
		} );

		it( 'Should get the plugin if the requested plugin is in the current state', function() {
			assert.equal( selectors.getPlugin( items, 'test' ).slug, 'test' );
		} );

		it( 'Should return a new object with no pointers to the one stored in state', function() {
			const plugin = selectors.getPlugin( items, 'fetchedTest' );
			plugin.fetched = false;
			assert.equal( selectors.getPlugin( items, 'fetchedTest' ).fetched, true );
		} );
	} );

	describe( 'isFetching', function() {
		it( 'Should get `true` if the requested plugin is not in the current state', function() {
			assert.equal( selectors.isFetching( fetchingItems, 'no.test' ), true );
		} );

		it( 'Should get `false` if the requested plugin is not being fetched', function() {
			assert.equal( selectors.isFetching( fetchingItems, 'test' ), false );
		} );

		it( 'Should get `true` if the requested plugin is being fetched', function() {
			assert.equal( selectors.isFetching( fetchingItems, 'fetchingTest' ), true );
		} );
	} );

	describe( 'isFetched', function() {
		it( 'Should get `false` if the requested plugin is not in the current state', function() {
			assert.equal( selectors.isFetched( items, 'no.test' ), false );
		} );

		it( 'Should get `false` if the requested plugin has not being fetched', function() {
			assert.equal( selectors.isFetched( items, 'test' ), false );
		} );

		it( 'Should get `true` if the requested plugin has being fetched', function() {
			assert.equal( selectors.isFetched( items, 'fetchedTest' ), true );
		} );

		it( 'Should get `true` if the requested plugin has being fetched even if it\'s being fetche again', function() {
			assert.equal( selectors.isFetched( items, 'fetchedTest2' ), true );
		} );
	} );
} );
