/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
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
} from '../action-types';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { getSiteTitle } from 'state/sites/selectors';

/*
 * Tests the cache for a site.
 *
 * @param  {number} siteId Site ID
 * @param  {string} siteTitle Site title
 * @param  {boolean} httpOnly Whether to send a non-secure request for the homepage
 * @returns {Function} Action thunk that tests the cache for a given site
 */
export const testCache = ( siteId, siteTitle, httpOnly ) => {
	return ( dispatch ) => {
		dispatch( removeNotice( 'wpsc-test-cache' ) );
		dispatch( { type: WP_SUPER_CACHE_TEST_CACHE, siteId } );

		return wp.req
			.post(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{
					path: '/wp-super-cache/v1/cache/test',
					body: JSON.stringify( { httponly: httpOnly } ),
					json: true,
				}
			)
			.then( ( { data } ) => {
				dispatch(
					successNotice(
						translate( 'Cache test completed successfully on %(siteTitle)s.', {
							args: { siteTitle },
						} ),
						{ id: 'wpsc-test-cache' }
					)
				);
				dispatch( { type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS, siteId, data } );
			} )
			.catch( () => {
				dispatch(
					errorNotice( translate( 'There was a problem testing the cache. Please try again.' ), {
						id: 'wpsc-test-cache',
					} )
				);
				dispatch( { type: WP_SUPER_CACHE_TEST_CACHE_FAILURE, siteId } );
			} );
	};
};

/*
 * Deletes the cache for a site.
 *
 * @param  {number} siteId Site ID
 * @param  {number} deleteAll Whether all caches should be deleted
 * @param  {number} deleteExpired Whether the expired files should be deleted
 * @returns {Function} Action thunk that deletes the cache for a given site
 */
export const deleteCache = ( siteId, deleteAll, deleteExpired ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_DELETE_CACHE,
			siteId,
		} );

		return wp.req
			.post(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{
					path: '/wp-super-cache/v1/cache',
					body: JSON.stringify( { all: deleteAll, expired: deleteExpired } ),
					json: true,
				}
			)
			.then( () => {
				dispatch( {
					type: WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
					deleteExpired,
					siteId,
				} );
			} )
			.catch( () => {
				dispatch( {
					type: WP_SUPER_CACHE_DELETE_CACHE_FAILURE,
					siteId,
				} );
			} );
	};
};

/*
 * Preloads the cache for a site.
 *
 * @param  {number} siteId Site ID
 * @returns {Function} Action thunk that preloads the cache for a given site
 */
export const preloadCache = ( siteId ) => {
	return ( dispatch, getState ) => {
		dispatch( { type: WP_SUPER_CACHE_PRELOAD_CACHE, siteId } );
		dispatch( removeNotice( 'wpsc-preload-cache' ) );

		return wp.req
			.post(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{ path: '/wp-super-cache/v1/preload', body: JSON.stringify( { enable: true } ), json: true }
			)
			.then( () => {
				dispatch( { type: WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS, siteId, preloading: true } );
				dispatch(
					successNotice(
						translate( 'Cache preload started successfully on %(siteTitle)s.', {
							args: { siteTitle: getSiteTitle( getState(), siteId ) },
						} ),
						{ id: 'wpsc-preload-cache' }
					)
				);
			} )
			.catch( () => {
				dispatch( { type: WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE, siteId } );
				dispatch(
					errorNotice( translate( 'There was a problem preloading the cache. Please try again.' ), {
						id: 'wpsc-preload-cache',
					} )
				);
			} );
	};
};

/*
 * Cancels preloading the cache for a site.
 *
 * @param  {number} siteId Site ID
 * @returns {Function} Action thunk that cancels preloading the cache for a given site
 */
export const cancelPreloadCache = ( siteId ) => {
	return ( dispatch, getState ) => {
		dispatch( { type: WP_SUPER_CACHE_PRELOAD_CACHE, siteId } );
		dispatch( removeNotice( 'wpsc-cancel-preload' ) );

		return wp.req
			.post(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{
					path: '/wp-super-cache/v1/preload',
					body: JSON.stringify( { enable: false } ),
					json: true,
				}
			)
			.then( () => {
				dispatch( { type: WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS, siteId, preloading: false } );
				dispatch(
					successNotice(
						translate( 'Cache preload cancelled successfully on %(siteTitle)s.', {
							args: { siteTitle: getSiteTitle( getState(), siteId ) },
						} ),
						{ id: 'wpsc-cancel-preload' }
					)
				);
			} )
			.catch( () => {
				dispatch( { type: WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE, siteId } );
				dispatch(
					errorNotice(
						translate( 'There was a problem cancelling the preload. Please try again.' ),
						{ id: 'wpsc-cancel-preload' }
					)
				);
			} );
	};
};
