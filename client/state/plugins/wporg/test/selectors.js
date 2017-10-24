/** @format */

/**
 * External dependencies
 */
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
		expect( typeof selectors.getPlugin ).toEqual( 'function' );
	} );

	test( 'Should contain isFetching method', () => {
		expect( typeof selectors.isFetching ).toEqual( 'function' );
	} );

	describe( 'getPlugin', () => {
		test( 'Should get null if the requested plugin is not in the current state', () => {
			expect( selectors.getPlugin( items, 'no-test' ) ).toEqual( null );
		} );

		test( 'Should get the plugin if the requested plugin is in the current state', () => {
			expect( selectors.getPlugin( items, 'test' ).slug ).toEqual( 'test' );
		} );

		test( 'Should return a new object with no pointers to the one stored in state', () => {
			let plugin = selectors.getPlugin( items, 'fetchedTest' );
			plugin.fetched = false;
			expect( selectors.getPlugin( items, 'fetchedTest' ).fetched ).toEqual( true );
		} );
	} );

	describe( 'isFetching', () => {
		test( 'Should get `true` if the requested plugin is not in the current state', () => {
			expect( selectors.isFetching( fetchingItems, 'no.test' ) ).toEqual( true );
		} );

		test( 'Should get `false` if the requested plugin is not being fetched', () => {
			expect( selectors.isFetching( fetchingItems, 'test' ) ).toEqual( false );
		} );

		test( 'Should get `true` if the requested plugin is being fetched', () => {
			expect( selectors.isFetching( fetchingItems, 'fetchingTest' ) ).toEqual( true );
		} );
	} );

	describe( 'isFetched', () => {
		test( 'Should get `false` if the requested plugin is not in the current state', () => {
			expect( selectors.isFetched( items, 'no.test' ) ).toEqual( false );
		} );

		test( 'Should get `false` if the requested plugin has not being fetched', () => {
			expect( selectors.isFetched( items, 'test' ) ).toEqual( false );
		} );

		test( 'Should get `true` if the requested plugin has being fetched', () => {
			expect( selectors.isFetched( items, 'fetchedTest' ) ).toEqual( true );
		} );

		test( "Should get `true` if the requested plugin has being fetched even if it's being fetche again", () => {
			expect( selectors.isFetched( items, 'fetchedTest2' ) ).toEqual( true );
		} );
	} );
} );
