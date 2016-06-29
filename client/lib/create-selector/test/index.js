/**
 * External dependencies
 */
import { expect } from 'chai';
import filter from 'lodash/filter';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import createSelector from '../';

describe( 'index', () => {
	let selector, getSitePosts;

	before( () => {
		selector = sinon.spy( ( state, siteId ) => {
			return filter( state.posts, { site_ID: siteId } );
		} );
		getSitePosts = createSelector( selector, ( state ) => state.posts );
		sinon.stub( console, 'warn' );
	} );

	beforeEach( () => {
		console.warn.reset();
		selector.reset();
		getSitePosts.memoizedSelector.cache.clear();
	} );

	after( () => {
		console.warn.restore();
	} );

	it( 'should expose its memoized function', () => {
		expect( getSitePosts.memoizedSelector ).to.be.a( 'function' );
	} );

	it( 'should create a function which returns the expected value when called', () => {
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			}
		};

		expect( getSitePosts( state, 2916284 ) ).to.eql( [
			{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
		] );
	} );

	it( 'should cache the result of a selector function', () => {
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			}
		};

		getSitePosts( state, 2916284 );
		getSitePosts( state, 2916284 );

		expect( selector ).to.have.been.calledOnce;
	} );

	it( 'should warn against complex arguments in development mode', () => {
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
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 38303081, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
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
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			}
		};

		getSitePosts( currentState, 2916284 );

		const nextState = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 38303081, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			}
		};

		expect( getSitePosts( nextState, 2916284 ) ).to.eql( [
			{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
		] );
		expect( selector ).to.have.been.calledTwice;
	} );

	it( 'should accept an array of dependent state values', () => {
		const getSitePostsWithArrayDependants = createSelector( selector, ( state ) => [ state.posts ] );
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			}
		};

		getSitePostsWithArrayDependants( state, 2916284 );
		getSitePostsWithArrayDependants( state, 2916284 );

		expect( selector ).to.have.been.calledOnce;
	} );

	it( 'should accept an array of dependent selectors', () => {
		const getPosts = ( state ) => state.posts;
		const getSitePostsWithArrayDependants = createSelector( selector, [ getPosts ] );
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
		const getSitePostsWithDefaultGetDependants = createSelector( selector );
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			}
		};

		getSitePostsWithDefaultGetDependants( state, 2916284 );
		getSitePostsWithDefaultGetDependants( state, 2916284 );

		expect( selector ).to.have.been.calledOnce;
	} );

	it( 'should default to watching entire state, busting if state has changed', () => {
		const getSitePostsWithDefaultGetDependants = createSelector( selector );
		const currentState = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			}
		};

		getSitePostsWithDefaultGetDependants( currentState, 2916284 );

		const nextState = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 38303081, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			}
		};

		getSitePostsWithDefaultGetDependants( nextState, 2916284 );

		expect( selector ).to.have.been.calledTwice;
	} );

	it( 'should accept an optional custom cache key generating function', () => {
		const getSitePostsWithCustomGetCacheKey = createSelector(
			selector,
			( state ) => state.posts,
			( state, siteId ) => `CUSTOM${ siteId }`
		);

		getSitePostsWithCustomGetCacheKey( { posts: {} }, 2916284 );

		expect( getSitePostsWithCustomGetCacheKey.memoizedSelector.cache.has( 'CUSTOM2916284' ) ).to.be.true;
	} );

	it( 'should call dependant state getter with arguments', () => {
		const getDeps = sinon.spy();
		const memoizedSelector = createSelector( () => null, getDeps );
		const state = {};

		memoizedSelector( state, 1, 2, 3 );

		expect( getDeps ).to.have.been.calledWithExactly( state, 1, 2, 3 );
	} );

	it( 'should handle an array of selectors instead of a dependant state getter', () => {
		const getPosts = sinon.spy();
		const getQuuxs = sinon.spy();
		const memoizedSelector = createSelector( () => null, [ getPosts, getQuuxs ] );
		const state = {};

		memoizedSelector( state, 1, 2, 3 );
		expect( getPosts ).to.have.been.calledWithExactly( state, 1, 2, 3 );
		expect( getQuuxs ).to.have.been.calledWithExactly( state, 1, 2, 3 );
	} );
} );
