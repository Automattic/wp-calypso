/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_DELETE_FILE,
	WP_SUPER_CACHE_DELETE_FILE_FAILURE,
	WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
} from '../action-types';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { getSiteTitle } from 'state/sites/selectors';

/*
 * Retrieves stats for a site.
 *
 * @param  {number} siteId Site ID
 * @returns {Function} Action thunk that requests stats for a given site
 */
export const generateStats = ( siteId ) => {
	return ( dispatch, getState ) => {
		dispatch( { type: WP_SUPER_CACHE_GENERATE_STATS, siteId } );
		dispatch( removeNotice( 'wpsc-cache-stats' ) );

		return wp.req
			.get( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, { path: '/wp-super-cache/v1/stats' } )
			.then( ( { data } ) => {
				dispatch( { type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS, siteId, stats: data } );
				dispatch(
					successNotice(
						translate( 'Cache stats regenerated on %(siteTitle)s.', {
							args: { siteTitle: getSiteTitle( getState(), siteId ) },
						} ),
						{ id: 'wpsc-cache-stats' }
					)
				);
			} )
			.catch( () => {
				dispatch( { type: WP_SUPER_CACHE_GENERATE_STATS_FAILURE, siteId } );
				dispatch(
					errorNotice(
						translate( 'There was a problem regenerating the stats. Please try again.' ),
						{ id: 'wpsc-cache-stats' }
					)
				);
			} );
	};
};

/*
 * Deletes a cached file for a site.
 *
 * @param  {number} siteId Site ID
 * @param  {string} url URL of cached file to delete
 * @param  {boolean} isSupercache Whether this is a supercache file
 * @param  {boolean} isCached Whether this is a cached file
 * @returns {Function} Action thunk that deletes the cached file for a given site
 */
export const deleteFile = ( siteId, url, isSupercache, isCached ) => {
	return ( dispatch ) => {
		dispatch( removeNotice( 'wpsc-delete-cached-file' ) );
		dispatch( { type: WP_SUPER_CACHE_DELETE_FILE, siteId } );

		return wp.req
			.post(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{
					body: JSON.stringify( { url } ),
					json: true,
					path: '/wp-super-cache/v1/cache',
				}
			)
			.then( () => {
				dispatch( {
					type: WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
					siteId,
					url,
					isSupercache,
					isCached,
				} );
			} )
			.catch( () => {
				dispatch(
					errorNotice(
						translate( 'There was a problem deleting the cached file. Please try again.' ),
						{ id: 'wpsc-delete-cached-file' }
					)
				);
				dispatch( { type: WP_SUPER_CACHE_DELETE_FILE_FAILURE, siteId } );
			} );
	};
};
