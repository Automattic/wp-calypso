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
	WP_SUPER_CACHE_TEST_CACHE,
	WP_SUPER_CACHE_TEST_CACHE_FAILURE,
	WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
} from '../action-types';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';

/*
 * Tests the cache for a site.
 *
 * @param  {Number} siteId Site ID
 * @param  {String} siteTitle Site title
 * @param  {Boolean} httpOnly Whether to send a non-secure request for the homepage
 * @returns {Function} Action thunk that tests the cache for a given site
 */
export const testCache = ( siteId, siteTitle, httpOnly ) => {
	return ( dispatch ) => {
		dispatch( removeNotice( 'wpsc-test-cache' ) );
		dispatch( { type: WP_SUPER_CACHE_TEST_CACHE, siteId } );

		return wp.req.post(
			{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
			{ path: '/wp-super-cache/v1/cache/test', body: JSON.stringify( { httponly: httpOnly } ), json: true } )
			.then( ( { data } ) => {
				dispatch( successNotice(
					translate( 'Cache test completed successfully on %(siteTitle)s.', { args: { siteTitle } } ),
					{ id: 'wpsc-test-cache' }
				) );
				dispatch( { type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS, siteId, data } );
			} )
			.catch( () => {
				dispatch( errorNotice(
					translate( 'There was a problem testing the cache. Please try again.' ),
					{ id: 'wpsc-test-cache' }
				) );
				dispatch( { type: WP_SUPER_CACHE_TEST_CACHE_FAILURE, siteId } );
			} );
	};
};

/*
 * Deletes the cache for a site.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} deleteAll Whether all caches should be deleted
 * @param  {Number} deleteExpired Whether the expired files should be deleted
 * @returns {Function} Action thunk that deletes the cache for a given site
 */
export const deleteCache = ( siteId, deleteAll, deleteExpired ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_DELETE_CACHE,
			siteId,
		} );

		return wp.req.post(
			{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
			{ path: '/wp-super-cache/v1/cache', body: JSON.stringify( { all: deleteAll, expired: deleteExpired } ), json: true } )
			.then( () => {
				dispatch( {
					type: WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
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
