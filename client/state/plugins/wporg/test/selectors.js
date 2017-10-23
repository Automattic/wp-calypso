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

const items = deepFreeze( {
	test: { slug: 'test' },
	fetchingTest: { slug: 'fetchingTest' },
	fetchedTest: { slug: 'fetchingTest', fetched: true },
	fetchedTest2: { slug: 'fetchingTest', fetched: true },
} );
const fetchingItems = deepFreeze( {
	test: false,
	fetchingTest: true,
	fetchedTest: false,
	fetchedTest2: true,
} );

describe( 'WPorg Selectors', () => {
	test( 'Should contain getPlugin method', () => {
		assert.equal( typeof selectors.getPlugin, 'function' );
	} );

	test( 'Should contain isFetching method', () => {
		assert.equal( typeof selectors.isFetching, 'function' );
	} );

	describe( 'getPlugin', () => {
		test( 'Should get null if the requested plugin is not in the current state', () => {
			assert.equal( selectors.getPlugin( items, 'no-test' ), null );
		} );

		test( 'Should get the plugin if the requested plugin is in the current state', () => {
			assert.equal( selectors.getPlugin( items, 'test' ).slug, 'test' );
		} );

		test( 'Should return a new object with no pointers to the one stored in state', () => {
			let plugin = selectors.getPlugin( items, 'fetchedTest' );
			plugin.fetched = false;
			assert.equal( selectors.getPlugin( items, 'fetchedTest' ).fetched, true );
		} );
	} );

	describe( 'isFetching', () => {
		test( 'Should get `true` if the requested plugin is not in the current state', () => {
			assert.equal( selectors.isFetching( fetchingItems, 'no.test' ), true );
		} );

		test( 'Should get `false` if the requested plugin is not being fetched', () => {
			assert.equal( selectors.isFetching( fetchingItems, 'test' ), false );
		} );

		test( 'Should get `true` if the requested plugin is being fetched', () => {
			assert.equal( selectors.isFetching( fetchingItems, 'fetchingTest' ), true );
		} );
	} );

	describe( 'isFetched', () => {
		test( 'Should get `false` if the requested plugin is not in the current state', () => {
			assert.equal( selectors.isFetched( items, 'no.test' ), false );
		} );

		test( 'Should get `false` if the requested plugin has not being fetched', () => {
			assert.equal( selectors.isFetched( items, 'test' ), false );
		} );

		test( 'Should get `true` if the requested plugin has being fetched', () => {
			assert.equal( selectors.isFetched( items, 'fetchedTest' ), true );
		} );

		test( "Should get `true` if the requested plugin has being fetched even if it's being fetche again", () => {
			assert.equal( selectors.isFetched( items, 'fetchedTest2' ), true );
		} );
	} );
} );
