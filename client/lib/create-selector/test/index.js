/* eslint-disable no-console */

/**
 * External dependencies
 */
import { expect } from 'chai';
import filter from 'lodash/filter';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import createSelector, { createSelectorPerKey } from '../';
import { useSandbox } from 'test/helpers/use-sinon';

const createSelectorFunctionNames = [ 'createSelector', 'createSelectorPerKey' ];
[ createSelector, createSelectorPerKey ].forEach( ( createSelectorFactory, createSelectorIndex ) => {
	describe( createSelectorFunctionNames[ createSelectorIndex ], () => {
		let selector, getSitePosts;

		useSandbox( ( sandbox ) => {
			sandbox.stub( console, 'warn' );
			selector = sandbox.spy( ( state, siteId ) => {
				return filter( state.posts, { site_ID: siteId } );
			} );
		} );

		before( () => {
			getSitePosts = createSelectorFactory( selector, ( state ) => state.posts );
		} );

		beforeEach( () => {
			getSitePosts.memoizedSelector.cache.clear();
		} );

		it( 'should expose its memoized function', () => {
			expect( getSitePosts.memoizedSelector ).to.be.a( 'function' );
		} );

		it( 'should create a function which returns the expected value when called', () => {
			const state = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64':
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				}
			};

			expect( getSitePosts( state, 2916284 ) ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			] );
		} );

		it( 'should cache the result of a selector function', () => {
			const state = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World'
					}
				}
			};

			getSitePosts( state, 2916284 );
			getSitePosts( state, 2916284 );

			expect( selector ).to.have.been.calledOnce;
		} );

		it( 'should warn against complex arguments in development mode', () => {
			// NOTE: if we use createSelectorFactory here console.warn will be called
			// six times, it's like the sinon stub does not reset after the test.
			getSitePosts = createSelector( selector, ( state ) => state.posts );

			const state = { posts: {} };

			getSitePosts( state, 1 );
			getSitePosts( state, '' );
			getSitePosts( state, 'foo' );
			getSitePosts( state, true );
			getSitePosts( state, null );
			getSitePosts( state, undefined );
			getSitePosts( state, {} );
			getSitePosts( state, [] );
			getSitePosts( state, 1, [] );

			expect( console.warn ).to.have.been.calledThrice;
		} );

		it( 'should return the expected value of differing arguments', () => {
			const state = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64':
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
					'6c831c187ffef321eb43a67761a525a3':
						{ ID: 413, site_ID: 38303081, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
				}
			};

			getSitePosts( state, 2916284 );
			const sitePosts = getSitePosts( state, 38303081 );
			getSitePosts( state, 2916284 );

			expect( sitePosts ).to.eql( [
				{ ID: 413, site_ID: 38303081, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			] );
			expect( selector ).to.have.been.calledTwice;
		} );

		it( 'should bust the cache when watched state changes', () => {
			const currentState = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64':
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				}
			};

			getSitePosts( currentState, 2916284 );

			const nextState = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64':
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
					'6c831c187ffef321eb43a67761a525a3':
						{ ID: 413, site_ID: 38303081, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
				}
			};

			expect( getSitePosts( nextState, 2916284 ) ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			] );
			expect( selector ).to.have.been.calledTwice;
		} );

		it( 'should accept an array of dependent state values', () => {
			const getSitePostsWithArrayDependants = createSelectorFactory( selector, ( state ) => [ state.posts ] );
			const state = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64':
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				}
			};

			getSitePostsWithArrayDependants( state, 2916284 );
			getSitePostsWithArrayDependants( state, 2916284 );

			expect( selector ).to.have.been.calledOnce;
		} );

		it( 'should accept an array of dependent selectors', () => {
			const getPosts = ( state ) => state.posts;
			const getSitePostsWithArrayDependants = createSelectorFactory( selector, [ getPosts ] );
			const state = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World'
					}
				}
			};

			const nextState = { posts: {} };

			getSitePostsWithArrayDependants( state, 2916284 );
			getSitePostsWithArrayDependants( state, 2916284 );
			getSitePostsWithArrayDependants( nextState, 2916284 );
			getSitePostsWithArrayDependants( nextState, 2916284 );

			expect( selector ).to.have.been.calledTwice;
		} );

		it( 'should default to watching entire state, returning cached result if no changes', () => {
			const getSitePostsWithDefaultGetDependants = createSelectorFactory( selector );
			const state = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64':
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				}
			};

			getSitePostsWithDefaultGetDependants( state, 2916284 );
			getSitePostsWithDefaultGetDependants( state, 2916284 );

			expect( selector ).to.have.been.calledOnce;
		} );

		it( 'should default to watching entire state, busting if state has changed', () => {
			const getSitePostsWithDefaultGetDependants = createSelectorFactory( selector );
			const currentState = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64':
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				}
			};

			getSitePostsWithDefaultGetDependants( currentState, 2916284 );

			const nextState = {
				posts: {
					'3d097cb7c5473c169bba0eb8e3c6cb64':
						{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
					'6c831c187ffef321eb43a67761a525a3':
						{ ID: 413, site_ID: 38303081, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
				}
			};

			getSitePostsWithDefaultGetDependants( nextState, 2916284 );

			expect( selector ).to.have.been.calledTwice;
		} );

		it( 'should accept an optional custom cache key generating function', () => {
			const getSitePostsWithCustomGetCacheKey = createSelectorFactory(
				selector,
				( state ) => state.posts,
				( state, siteId ) => `CUSTOM${ siteId }`
			);

			getSitePostsWithCustomGetCacheKey( { posts: {} }, 2916284 );

			expect( getSitePostsWithCustomGetCacheKey.memoizedSelector.cache.has( 'CUSTOM2916284' ) ).to.be.true;
		} );

		it( 'should call dependant state getter with arguments', () => {
			const getDeps = sinon.spy();
			const memoizedSelector = createSelectorFactory( () => null, getDeps );
			const state = {};

			memoizedSelector( state, 1, 2, 3 );

			expect( getDeps ).to.have.been.calledWithExactly( state, 1, 2, 3 );
		} );

		it( 'should handle an array of selectors instead of a dependant state getter', () => {
			const getPosts = sinon.spy();
			const getQuuxs = sinon.spy();
			const memoizedSelector = createSelectorFactory( () => null, [ getPosts, getQuuxs ] );
			const state = {};

			memoizedSelector( state, 1, 2, 3 );
			expect( getPosts ).to.have.been.calledWithExactly( state, 1, 2, 3 );
			expect( getQuuxs ).to.have.been.calledWithExactly( state, 1, 2, 3 );
		} );
	} );
} );

describe( 'createSelectorPerKey specific', () => {

	let selector, depedent, keyFunc, getStats;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
		selector = sandbox.spy( ( state, statType ) => {
			return state[ statType ];
		} );
		depedent = sandbox.spy( ( state, statType ) => {
			return state[ statType ];
		} );
		keyFunc = sandbox.spy( ( state, statType ) => {
			return statType;
		} );
	} );

	before( () => {
		getStats = createSelectorPerKey( selector, depedent, keyFunc );
	} );

	beforeEach( () => {
		getStats.memoizedSelector.cache.clear();
	} );

	it( 'should bust the cache of specific key when watched state changes', () => {
		const statVisitors = {
			numVisitors: 5
		};
		const statAuthors1 = {
			numAuthros: 9
		};
		const statAuthors2 = {
			numAuthros: 9
		};
		const currentState = {
			statVisitors, statAuthors: statAuthors1
		};

		// First call to selector with visitors
		getStats( currentState, 'statVisitors' );

		// Second call to selector authros
		getStats( currentState, 'statAuthors' );

		const nextState = {
			statVisitors, statAuthors: statAuthors2
		};

		// This call should no call the selector as only the authors
		// stats were changed and the visitor is not dependent on that.
		expect( getStats( nextState, 'statVisitors' ) ).to.equal( statVisitors );
		expect( selector ).to.have.been.calledTwice;
	} );
} );
