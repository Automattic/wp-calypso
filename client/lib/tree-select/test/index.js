/** @format */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import treeSelect, { MixedMap } from '../';

describe( 'index', () => {
	describe( '#treeSelect', () => {
		const post1 = { id: 'id1', text: 'here is post 1', siteId: 'site1' };
		const post2 = { id: 'id2', text: 'here is post 2', siteId: 'site1' };
		const post3 = { id: 'id3', text: 'here is post 3', siteId: 'site2' };

		let getSitePosts;
		let selector;
		let getDependents;

		beforeEach( () => {
			selector = jest.fn( ( [ posts ], siteId ) => filter( posts, { siteId } ) );
			getDependents = jest.fn( state => [ state.posts ] );
			getSitePosts = treeSelect( getDependents, selector );
		} );

		test( 'should create a function which returns the expected value when called', () => {
			const state = {
				posts: {
					[ post1.id ]: post1,
					[ post2.id ]: post2,
					[ post3.id ]: post3,
				},
			};

			expect( getSitePosts( state, 'site1' ) ).toEqual( [ post1, post2 ] );
		} );

		test( 'should cache the result of a selector function', () => {
			const reduxState = {
				posts: {
					[ post1.id ]: post1,
					[ post2.id ]: post2,
					[ post3.id ]: post3,
				},
			};

			getSitePosts( reduxState, 2916284 );
			getSitePosts( reduxState, 2916284 );

			expect( selector.mock.calls.length ).toBe( 1 );
		} );

		test( 'should throw an error in development when given object arguments', () => {
			const state = {};

			expect( () => getSitePosts( state, {} ) ).toThrow();
			expect( () => getSitePosts( state, [] ) ).toThrow();
			expect( () => getSitePosts( state, 1, [] ) ).toThrow();
		} );

		test( 'should not throw an error in production even when given object arguments', () => {
			const prevEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			const state = {};
			expect( () => getSitePosts( state, {} ) ).not.toThrow();
			expect( () => getSitePosts( state, [] ) ).not.toThrow();
			expect( () => getSitePosts( state, 1, [] ) ).not.toThrow();

			process.env.NODE_ENV = prevEnv;
		} );

		test( 'should not throw an error in development when given primitives', () => {
			const state = {};

			expect( () => getSitePosts( state, 1 ) ).not.toThrow();
			expect( () => getSitePosts( state, '' ) ).not.toThrow();
			expect( () => getSitePosts( state, 'foo' ) ).not.toThrow();
			expect( () => getSitePosts( state, true ) ).not.toThrow();
			expect( () => getSitePosts( state, null ) ).not.toThrow();
			expect( () => getSitePosts( state, undefined ) ).not.toThrow();
		} );

		test( 'should call selector when making non-cached calls', () => {
			const state = {
				posts: {
					[ post1.id ]: post1,
					[ post3.id ]: post3,
				},
			};

			const sitePosts1 = getSitePosts( state, post1.siteId );
			const sitePosts3 = getSitePosts( state, post3.siteId );

			expect( sitePosts1 ).toEqual( [ post1 ] );
			expect( sitePosts3 ).toEqual( [ post3 ] );
			expect( selector.mock.calls.length ).toBe( 2 );
		} );

		test( 'should bust the cache when watched state changes', () => {
			const prevState = {
				posts: {
					[ post1.id ]: post1,
				},
			};

			getSitePosts( prevState, post1.siteId );

			const nextState = {
				posts: {
					[ post1.id ]: { ...post1, modified: true },
				},
			};

			expect( getSitePosts( nextState, post1.siteId ) ).toEqual( [ { ...post1, modified: true } ] );
			expect( selector.mock.calls.length ).toBe( 2 );
		} );

		test( 'should maintain the cache for multiple dependents', () => {
			const getPostByIdWithDataSpy = jest.fn( ( [ post ] ) => {
				return {
					...post,
					withData: true,
				};
			} );

			const getPostByIdWithData = treeSelect(
				( state, postId ) => [ state.posts[ postId ] ],
				getPostByIdWithDataSpy
			);

			const state = {
				posts: {
					[ post1.id ]: post1,
					[ post2.id ]: post2,
				},
			};

			getPostByIdWithData( state, post1.id ); // dependents is [ post1 ]
			getPostByIdWithData( state, post2.id ); // dependents is [ post2 ]
			getPostByIdWithData( state, post1.id ); // dependents is [ post1 ]. should use cache

			expect( getPostByIdWithDataSpy.mock.calls.length ).toBe( 2 );
		} );

		test( 'should throw an error if getDependents is missing', () => {
			expect( () => treeSelect( undefined, selector ) ).toThrow();
		} );

		test( 'should throw an error if selector is missing', () => {
			expect( () => treeSelect( getDependents ) ).toThrow();
		} );

		test( 'should call dependant state getter with dependents and arguments', () => {
			const memoizedSelector = treeSelect( getDependents, getDependents );
			const state = { posts: {} };

			memoizedSelector( state, 1, 2, 3 );

			expect( getDependents ).toHaveBeenCalledWith( [ state.posts ], 1, 2, 3 );
		} );
	} );

	describe( '#MixedMap', () => {
		test( 'should successfully construct a new version', () => {
			expect( new MixedMap() ).toBeInstanceOf( MixedMap );
		} );

		test( 'should be able to set and get', () => {
			const weakKey = {};
			expect( new MixedMap().set( 4, 'four' ).get( 4 ) ).toBe( 'four' );
			expect( new MixedMap().set( weakKey, 'weakKey' ).get( weakKey ) ).toBe( 'weakKey' );
		} );

		test( 'should be able to construct via iterator', () => {
			const key = new Array();
			const map = new MixedMap( [ [ 1, 1 ], [ 2, 2 ], [ key, 'key' ] ] );

			expect( map.get( key ) ).toBe( 'key' );
			expect( map.get( 1 ) ).toBe( 1 );
		} );

		test( 'should be able to clear', () => {
			const key = new Array();
			const map = new MixedMap().set( 4, 4 ).set( key, 'key' );
			map.clear();

			expect( map.get( 4 ) ).toBeFalsy();
			expect( map.get( key ) ).toBeFalsy();
		} );
	} );
} );
