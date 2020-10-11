/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getPlugin, isFetching, isFetched } from '../selectors';

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
const state = deepFreeze( {
	plugins: { wporg: { items, fetchingItems } },
} );

describe( 'WPorg Selectors', () => {
	test( 'Should contain getPlugin method', () => {
		expect( typeof getPlugin ).toBe( 'function' );
	} );

	test( 'Should contain isFetching method', () => {
		expect( typeof isFetching ).toBe( 'function' );
	} );

	describe( 'getPlugin', () => {
		test( 'Should get null if the requested plugin is not in the current state', () => {
			expect( getPlugin( state, 'no-test' ) ).toBeNull();
		} );

		test( 'Should get the plugin if the requested plugin is in the current state', () => {
			expect( getPlugin( state, 'test' ).slug ).toBe( 'test' );
		} );

		test( 'Should return a new object with no pointers to the one stored in state', () => {
			const plugin = getPlugin( state, 'fetchedTest' );
			plugin.fetched = false;
			expect( getPlugin( state, 'fetchedTest' ).fetched ).toBe( true );
		} );
	} );

	describe( 'isFetching', () => {
		test( 'Should get `true` if the requested plugin is not in the current state', () => {
			expect( isFetching( state, 'no.test' ) ).toBe( true );
		} );

		test( 'Should get `false` if the requested plugin is not being fetched', () => {
			expect( isFetching( state, 'test' ) ).toBe( false );
		} );

		test( 'Should get `true` if the requested plugin is being fetched', () => {
			expect( isFetching( state, 'fetchingTest' ) ).toBe( true );
		} );
	} );

	describe( 'isFetched', () => {
		test( 'Should get `false` if the requested plugin is not in the current state', () => {
			expect( isFetched( state, 'no.test' ) ).toBe( false );
		} );

		test( 'Should get `false` if the requested plugin has not being fetched', () => {
			expect( isFetched( state, 'test' ) ).toBe( false );
		} );

		test( 'Should get `true` if the requested plugin has being fetched', () => {
			expect( isFetched( state, 'fetchedTest' ) ).toBe( true );
		} );

		test( "Should get `true` if the requested plugin has being fetched even if it's being fetche again", () => {
			expect( isFetched( state, 'fetchedTest2' ) ).toBe( true );
		} );
	} );
} );
