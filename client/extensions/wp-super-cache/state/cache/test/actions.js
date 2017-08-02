/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WP_SUPER_CACHE_DELETE_CACHE,
	WP_SUPER_CACHE_DELETE_CACHE_FAILURE,
	WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
	WP_SUPER_CACHE_PRELOAD_CACHE,
	WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE,
	WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
	WP_SUPER_CACHE_TEST_CACHE,
	WP_SUPER_CACHE_TEST_CACHE_FAILURE,
	WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
} from '../../action-types';
import {
	cancelPreloadCache,
	deleteCache,
	preloadCache,
	testCache,
} from '../actions';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 123456;
	const failedSiteId = 456789;
	const results = {
		data: {
			attempts: {
				first: {
					status: 'OK',
				}
			}
		}
	};

	describe( '#testCache()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/cache/test' } )
				.reply( 200, results )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/cache/test' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch test cache action when thunk triggered', () => {
			testCache( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_TEST_CACHE,
				siteId,
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return testCache( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
					data: results.data,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return testCache( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_TEST_CACHE_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );

	describe( '#deleteCache()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/cache' } )
				.reply( 200, { wp_delete_cache: true } )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/cache' } )
				.reply( 403 );
		} );

		it( 'should dispatch test cache action when thunk triggered', () => {
			deleteCache( siteId, false )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_DELETE_CACHE,
				siteId,
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return deleteCache( siteId, false )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return deleteCache( failedSiteId, false )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_DELETE_CACHE_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );

	describe( '#preloadCache()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/preload' } )
				.reply( 200, { enabled: true } )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/preload' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch preload cache action when thunk triggered', () => {
			preloadCache( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_PRELOAD_CACHE,
				siteId,
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return preloadCache( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return preloadCache( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );

	describe( '#cancelPreloadCache()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/preload' } )
				.reply( 200, { enabled: false } )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/preload' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch preload cache action when thunk triggered', () => {
			cancelPreloadCache( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_PRELOAD_CACHE,
				siteId,
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return cancelPreloadCache( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return cancelPreloadCache( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );
} );
