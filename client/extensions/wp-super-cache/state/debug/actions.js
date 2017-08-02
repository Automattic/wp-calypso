/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_DELETE_DEBUG_LOG,
	WP_SUPER_CACHE_DELETE_DEBUG_LOG_FAILURE,
	WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
} from '../action-types';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';

/*
 * Retrieves debug logs for a site.
 *
 * @param  {Number} siteId Site ID
 * @returns {Function} Action thunk that requests debug logs for a given site
 */
export const requestDebugLogs = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS,
			siteId,
		} );

		return wp.req.get(
			{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
			{ path: '/wp-super-cache/v1/debug' } )
			.then( ( { data } ) => {
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
					siteId,
					data,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};

/*
 * Deletes a debug log on a given site.
 *
 * @param  {Number} siteId Site ID
 * @param  {String} filename The debug log file to be deleted
 * @returns {Function} Action thunk that deletes the debug log on a given site
 */
export const deleteDebugLog = ( siteId, filename ) => {
	return ( dispatch ) => {
		dispatch( removeNotice( 'wpsc-delete-debug-log' ) );
		dispatch( {
			type: WP_SUPER_CACHE_DELETE_DEBUG_LOG,
			siteId,
			filename,
		} );

		return wp.req.post(
			{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
			{
				path: '/wp-super-cache/v1/debug&_method=DELETE',
				body: JSON.stringify( { filename } ),
				json: true
			} )
			.then( () => {
				dispatch( successNotice(
					translate( 'Successfully deleted debug log' ),
					{ id: 'wpsc-delete-debug-log' }
				) );
				dispatch( {
					type: WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS,
					siteId,
					filename,
				} );
			} )
			.catch( () => {
				dispatch( errorNotice(
					translate( 'There was a problem deleting the debug log. Please try again.' ),
					{ id: 'wpsc-delete-debug-log' }
				) );
				dispatch( {
					type: WP_SUPER_CACHE_DELETE_DEBUG_LOG_FAILURE,
					siteId,
					filename,
				} );
			} );
	};
};
