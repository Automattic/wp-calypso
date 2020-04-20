/**
 * Internal dependencies
 */
import treeSelect from '../src';

describe( 'index', () => {
	describe( '#treeSelect', () => {
		const post1 = { id: 'id1', text: 'here is post 1', siteId: 'site1' };
		const post2 = { id: 'id2', text: 'here is post 2', siteId: 'site1' };
		const post3 = { id: 'id3', text: 'here is post 3', siteId: 'site2' };

		let getSitePosts;
		let selector;
		let getDependents;

		beforeEach( () => {
			selector = jest.fn( ( [ posts ], siteId ) =>
				Object.values( posts ).filter( ( p ) => p.siteId === siteId )
			);
			getDependents = jest.fn( ( state ) => [ state.posts ] );
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

			expect( selector.mock.calls ).toHaveLength( 1 );
		} );

		test( 'should cache the result of a selector function that has multiple dependents', () => {
			const site1 = { id: 'siteId1' };
			const site2 = { id: 'siteId2' };
			const reduxState = {
				posts: {
					[ post1.id ]: post1,
					[ post2.id ]: post2,
					[ post3.id ]: post3,
				},
				sites: {
					[ site1.id ]: site1,
					[ site2.id ]: site2,
				},
			};

			const takeOne = jest.fn( ( [ posts, sites ] ) => [
				Object.values( posts )[ 0 ],
				Object.values( sites )[ 0 ],
			] );
			const getDeps = jest.fn( ( state ) => [ state.posts, state.sites ] );
			const arborealTakeOne = treeSelect( getDeps, takeOne );

			arborealTakeOne( reduxState, 42 );
			const results = arborealTakeOne( reduxState, 42 );
			expect( results[ 0 ] ).toBe( Object.values( reduxState.posts )[ 0 ] );
			expect( results[ 1 ] ).toBe( Object.values( reduxState.sites )[ 0 ] );

			expect( takeOne.mock.calls ).toHaveLength( 1 );
		} );

		test( 'should throw an error if getDependents is missing', () => {
			expect( () => treeSelect( undefined, selector ) ).toThrow();
		} );

		test( 'should throw an error if selector is missing', () => {
			expect( () => treeSelect( getDependents ) ).toThrow();
		} );

		test( 'should not throw an error in production for missing args', () => {
			const prevEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			expect( () => treeSelect() ).not.toThrow();

			process.env.NODE_ENV = prevEnv;
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

			const state = { posts: [] };
			expect( () => getSitePosts( state, {} ) ).not.toThrow();
			expect( () => getSitePosts( state, [] ) ).not.toThrow();
			expect( () => getSitePosts( state, 1, [] ) ).not.toThrow();

			process.env.NODE_ENV = prevEnv;
		} );

		test( 'should not throw an error in development when given primitives', () => {
			const state = { posts: [] };

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
			expect( selector.mock.calls ).toHaveLength( 2 );
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
			expect( selector.mock.calls ).toHaveLength( 2 );
		} );

		test( 'should maintain the cache for unique dependents simultaneously', () => {
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

			expect( getPostByIdWithDataSpy.mock.calls ).toHaveLength( 2 );
		} );

		test( 'should call dependant state getter with dependents and arguments', () => {
			const memoizedSelector = treeSelect( getDependents, getDependents );
			const state = { posts: {} };

			memoizedSelector( state, 1, 2, 3 );

			expect( getDependents ).toHaveBeenCalledWith( [ state.posts ], 1, 2, 3 );
		} );

		test( 'should bust the cache when clearCache() method is called', () => {
			const reduxState = {
				posts: {
					[ post1.id ]: post1,
					[ post2.id ]: post2,
					[ post3.id ]: post3,
				},
			};

			const firstResult = getSitePosts( reduxState, 'site1' );
			const memoizedResult = getSitePosts( reduxState, 'site1' );

			// Repeated call returns identical object
			expect( memoizedResult ).toBe( firstResult );

			getSitePosts.clearCache();
			const afterClearResult = getSitePosts( reduxState, 2916284 );

			// Is forced to compute a new result after clearCache()
			expect( afterClearResult ).not.toBe( firstResult );
		} );

		test( 'should memoize a nullish value returned by getDependents', () => {
			const memoizedSelector = treeSelect(
				() => [ null, undefined ],
				() => []
			);
			const state = {};

			const firstResult = memoizedSelector( state );
			const secondResult = memoizedSelector( state );
			expect( firstResult ).toBe( secondResult );
		} );

		test( 'throws on a non-nullish primitive value returned by getDependents', () => {
			[ true, 1, 'a', false, '', 0 ].forEach( ( primitive ) => {
				const memoizedSelector = treeSelect(
					() => [ primitive ],
					() => []
				);
				const state = {};

				expect( () => memoizedSelector( state ) ).toThrow();
			} );
		} );

		test( 'accepts a getCacheKey option that enables object arguments', () => {
			const reduxState = {
				posts: {
					[ post1.id ]: post1,
					[ post2.id ]: post2,
					[ post3.id ]: post3,
				},
			};

			const memoizedSelector = treeSelect(
				( state ) => [ state.posts ],
				( [ posts ], query ) => Object.values( posts ).filter( ( p ) => p.siteId === query.siteId ),
				{ getCacheKey: ( query ) => `key:${ query.siteId }` }
			);

			// The arguments are objects, they are not identical, but generated keys are.
			// Therefore, the second call returns the memoized result.
			const firstResult = memoizedSelector( reduxState, { siteId: 'site1', foo: 'bar' } );
			const secondResult = memoizedSelector( reduxState, { siteId: 'site1', foo: 'baz' } );
			expect( firstResult ).toEqual( [ post1, post2 ] );
			expect( firstResult ).toBe( secondResult );
		} );
	} );
} );
