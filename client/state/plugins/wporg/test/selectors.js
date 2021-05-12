/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getNextPluginsListPage,
	getPlugin,
	isFetched,
	isFetching,
	isFetchingPluginsList,
} from '../selectors';

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
const fetchingLists = deepFreeze( {
	category: {
		popular: true,
		new: false,
	},
	search: {
		security: true,
		enhancement: false,
	},
} );
const listsPagination = deepFreeze( {
	category: {
		popular: {
			page: 1,
			pages: 100,
			results: 2359,
		},
	},
} );
const state = deepFreeze( {
	plugins: { wporg: { items, fetchingItems, fetchingLists, listsPagination } },
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
		test( 'Should get `false` if the requested plugin is not in the current state', () => {
			expect( isFetching( state, 'no.test' ) ).toBe( false );
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

	describe( 'isFetchingPluginsList', () => {
		test( 'Should return false by default', () => {
			const emptyState = { plugins: { wporg: { fetchingLists: {} } } };
			expect( isFetchingPluginsList( emptyState, 'popular' ) ).toBe( false );
		} );
		test( 'Should return true when category list is being fetched', () => {
			expect( isFetchingPluginsList( state, 'popular' ) ).toBe( true );
		} );
		test( 'Should return false when category list is not being fetched', () => {
			expect( isFetchingPluginsList( state, 'new' ) ).toBe( false );
		} );
		test( 'Should return true when search term list is being fetched', () => {
			expect( isFetchingPluginsList( state, undefined, 'security' ) ).toBe( true );
		} );
		test( 'Should return false when search term list is not being fetched', () => {
			expect( isFetchingPluginsList( state, 'enahncement' ) ).toBe( false );
		} );
	} );

	describe( 'getNextPluginsListPage', () => {
		test( 'Should return null by default', () => {
			const emptyState = { plugins: { wporg: { listsPagination: {} } } };
			expect( getNextPluginsListPage( emptyState, 'popular' ) ).toBe( null );
		} );
		test( 'Should return null when this is the last page', () => {
			const currentState = {
				plugins: {
					wporg: {
						listsPagination: {
							popular: {
								page: 10,
								pages: 10,
								results: 235,
							},
						},
					},
				},
			};
			expect( getNextPluginsListPage( currentState, 'popular' ) ).toBe( null );
		} );
		test( 'Should return next page number when there is one', () => {
			expect( getNextPluginsListPage( state, 'popular' ) ).toBe( 2 );
		} );
	} );
} );
