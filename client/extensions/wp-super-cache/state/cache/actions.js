/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_DELETE_CACHE,
	WP_SUPER_CACHE_DELETE_CACHE_FAILURE,
	WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
	WP_SUPER_CACHE_TEST_CACHE,
} from '../action-types';

/*
 * Tests the cache for a site.
 *
 * @param  {Number} siteId Site ID
 * @param  {String} siteTitle Site title
 * @param  {Boolean} httpOnly Whether to send a non-secure request for the homepage
 * @returns {Function} Action thunk that tests the cache for a given site
 */
export const testCache = ( siteId, httpOnly ) => {
	return {
		type: WP_SUPER_CACHE_TEST_CACHE,
		siteId,
		httpOnly
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
