/** @format */
/* eslint-disable no-console */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { filter } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import createSelector from '../';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'index', () => {
	let selector, getSitePosts;

	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
		selector = sandbox.spy( ( state, siteId ) => {
			return filter( state.posts, { site_ID: siteId } );
		} );
	} );

	beforeAll( () => {
		getSitePosts = createSelector( selector, state => state.posts );
	} );

	beforeEach( () => {
		getSitePosts.memoizedSelector.cache.clear();
	} );

	test( 'should expose its memoized function', () => {
		expect( getSitePosts.memoizedSelector ).to.be.a( 'function' );
	} );

	test( 'should create a function which returns the expected value when called', () => {
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
			},
		};

		expect( getSitePosts( state, 2916284 ) ).to.eql( [
			{
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
			},
		] );
	} );

	test( 'should cache the result of a selector function', () => {
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
			},
		};

		getSitePosts( state, 2916284 );
		getSitePosts( state, 2916284 );

		expect( selector ).to.have.been.calledOnce;
	} );

	describe( 'warning against complex arguments in development mode', () => {
		test( 'should warn against objects being passed', () => {
			const state = { posts: {} };

			getSitePosts( state, {} );

			expect( console.warn ).to.have.been.calledOnce;
		} );

		test( 'should warn against arrays being passed', () => {
			const state = { posts: {} };

			getSitePosts( state, [] );

			expect( console.warn ).to.have.been.calledOnce;
		} );

		test( 'should warn against arrays being passed amoungst mixed arguments', () => {
			const state = { posts: {} };

			getSitePosts( state, 1, [] );

			expect( console.warn ).to.have.been.calledOnce;
		} );

		test( 'should not warn against numbers, bools, nils or strings being passed', () => {
			const state = { posts: {} };

			getSitePosts( state, 1 );
			getSitePosts( state, '' );
			getSitePosts( state, 'foo' );
			getSitePosts( state, true );
			getSitePosts( state, null );
			getSitePosts( state, undefined );

			expect( console.warn ).not.to.have.been.called;
		} );
	} );

	test( 'should return the expected value of differing arguments', () => {
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
				'6c831c187ffef321eb43a67761a525a3': {
					ID: 413,
					site_ID: 38303081,
					global_ID: '6c831c187ffef321eb43a67761a525a3',
					title: 'Ribs & Chicken',
				},
			},
		};

		getSitePosts( state, 2916284 );
		const sitePosts = getSitePosts( state, 38303081 );
		getSitePosts( state, 2916284 );

		expect( sitePosts ).to.eql( [
			{
				ID: 413,
				site_ID: 38303081,
				global_ID: '6c831c187ffef321eb43a67761a525a3',
				title: 'Ribs & Chicken',
			},
		] );
		expect( selector ).to.have.been.calledTwice;
	} );

	test( 'should bust the cache when watched state changes', () => {
		const currentState = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
			},
		};

		getSitePosts( currentState, 2916284 );

		const nextState = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
				'6c831c187ffef321eb43a67761a525a3': {
					ID: 413,
					site_ID: 38303081,
					global_ID: '6c831c187ffef321eb43a67761a525a3',
					title: 'Ribs & Chicken',
				},
			},
		};

		expect( getSitePosts( nextState, 2916284 ) ).to.eql( [
			{
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World',
			},
		] );
		expect( selector ).to.have.been.calledTwice;
	} );

	test( 'should accept an array of dependent state values', () => {
		const getSitePostsWithArrayDependants = createSelector( selector, state => [ state.posts ] );
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
			},
		};

		getSitePostsWithArrayDependants( state, 2916284 );
		getSitePostsWithArrayDependants( state, 2916284 );

		expect( selector ).to.have.been.calledOnce;
	} );

	test( 'should accept an array of dependent selectors', () => {
		const getPosts = state => state.posts;
		const getSitePostsWithArrayDependants = createSelector( selector, [ getPosts ] );
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
			},
		};

		const nextState = { posts: {} };

		getSitePostsWithArrayDependants( state, 2916284 );
		getSitePostsWithArrayDependants( state, 2916284 );
		getSitePostsWithArrayDependants( nextState, 2916284 );
		getSitePostsWithArrayDependants( nextState, 2916284 );

		expect( selector ).to.have.been.calledTwice;
	} );

	test( 'should default to watching entire state, returning cached result if no changes', () => {
		const getSitePostsWithDefaultGetDependants = createSelector( selector );
		const state = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
			},
		};

		getSitePostsWithDefaultGetDependants( state, 2916284 );
		getSitePostsWithDefaultGetDependants( state, 2916284 );

		expect( selector ).to.have.been.calledOnce;
	} );

	test( 'should default to watching entire state, busting if state has changed', () => {
		const getSitePostsWithDefaultGetDependants = createSelector( selector );
		const currentState = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
			},
		};

		getSitePostsWithDefaultGetDependants( currentState, 2916284 );

		const nextState = {
			posts: {
				'3d097cb7c5473c169bba0eb8e3c6cb64': {
					ID: 841,
					site_ID: 2916284,
					global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
					title: 'Hello World',
				},
				'6c831c187ffef321eb43a67761a525a3': {
					ID: 413,
					site_ID: 38303081,
					global_ID: '6c831c187ffef321eb43a67761a525a3',
					title: 'Ribs & Chicken',
				},
			},
		};

		getSitePostsWithDefaultGetDependants( nextState, 2916284 );

		expect( selector ).to.have.been.calledTwice;
	} );

	test( 'should accept an optional custom cache key generating function', () => {
		const getSitePostsWithCustomGetCacheKey = createSelector(
			selector,
			state => state.posts,
			( state, siteId ) => `CUSTOM${ siteId }`
		);

		getSitePostsWithCustomGetCacheKey( { posts: {} }, 2916284 );

		expect( getSitePostsWithCustomGetCacheKey.memoizedSelector.cache.has( 'CUSTOM2916284' ) ).to.be
			.true;
	} );

	describe( 'when no custom cache key generating function is given', () => {
		test( 'should to create a default key by joining args', () => {
			const memoizedSelector = createSelector( selector );

			memoizedSelector( {}, 'a', 'b', 'c', 1, 2, 3 );

			expect( memoizedSelector.memoizedSelector.cache.has( 'a,b,c,1,2,3' ) ).to.be.true;
		} );
	} );

	describe( 'when "cachePerKey" argument is "true"', () => {
		test( 'should clear cache when dependants do not match, but only per key', () => {
			const memoizedSelector = createSelector(
				( state, x, y, z ) => state[ x ][ y ][ z ],
				state => state.a.b,
				null,
				true
			);
			const state = {
				a: {
					b: {
						c: 'cc',
						d: 'dd',
					},
				},
			};

			memoizedSelector( state, 'a', 'b', 'c' );

			expect( memoizedSelector.memoizedSelector.cache.get( 'a,b,c' ) ).to.eql( 'cc' );
			expect( memoizedSelector.memoizedSelector.cache.has( 'a,b,d' ) ).to.be.false;

			memoizedSelector( state, 'a', 'b', 'd' );

			expect( memoizedSelector.memoizedSelector.cache.get( 'a,b,c' ) ).to.eql( 'cc' );
			expect( memoizedSelector.memoizedSelector.cache.get( 'a,b,d' ) ).to.eql( 'dd' );

			// Modifying the dependant value
			state.a.b = {
				c: 'ccc',
				d: 'ddd',
				e: 'eee',
			};

			memoizedSelector( state, 'a', 'b', 'c' );

			expect( memoizedSelector.memoizedSelector.cache.get( 'a,b,c' ) ).to.eql( 'ccc' );
			expect( memoizedSelector.memoizedSelector.cache.get( 'a,b,d' ) ).to.eql( 'dd' );

			memoizedSelector( state, 'a', 'b', 'd' );

			expect( memoizedSelector.memoizedSelector.cache.get( 'a,b,c' ) ).to.eql( 'ccc' );
			expect( memoizedSelector.memoizedSelector.cache.get( 'a,b,d' ) ).to.eql( 'ddd' );
		} );
	} );

	test( 'should call dependant state getter with arguments', () => {
		const getDeps = sinon.spy();
		const memoizedSelector = createSelector( () => null, getDeps );
		const state = {};

		memoizedSelector( state, 1, 2, 3 );

		expect( getDeps ).to.have.been.calledWithExactly( state, 1, 2, 3 );
	} );

	test( 'should handle an array of selectors instead of a dependant state getter', () => {
		const getPosts = sinon.spy();
		const getQuuxs = sinon.spy();
		const memoizedSelector = createSelector( () => null, [ getPosts, getQuuxs ] );
		const state = {};

		memoizedSelector( state, 1, 2, 3 );
		expect( getPosts ).to.have.been.calledWithExactly( state, 1, 2, 3 );
		expect( getQuuxs ).to.have.been.calledWithExactly( state, 1, 2, 3 );
	} );
} );
