/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_RESTORE_SETTINGS,
	WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_SAVE_SETTINGS,
	WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
} from '../action-types';
import { normalizeSettings, sanitizeSettings } from './utils';
import { requestStatus } from '../status/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { getSiteTitle } from 'state/sites/selectors';

/**
 * Returns an action object to be used in signalling that settings have been received.
 *
 * @param  {number} siteId Site ID
 * @param  {object} settings Settings object
 * @returns {object} Action object
 */
export const receiveSettings = ( siteId, settings ) => ( {
	type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
	siteId,
	settings,
} );

/*
 * Retrieves settings for a site.
 *
 * @param  {number} siteId Site ID
 * @returns {Function} Action thunk that requests settings for a given site
 */
export const requestSettings = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_REQUEST_SETTINGS,
			siteId,
		} );

		return wp.req
			.get(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{ path: '/wp-super-cache/v1/settings' }
			)
			.then( ( { data } ) => {
				dispatch( receiveSettings( siteId, normalizeSettings( data ) || {} ) );
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};

/**
 * Saves settings for a site.
 *
 * @param  {number} siteId Site ID
 * @param  {object} settings Updated settings
 * @returns {Function} Action thunk that updates the settings for a given site
 */
export const saveSettings = ( siteId, settings ) => {
	return ( dispatch ) => {
		dispatch( { type: WP_SUPER_CACHE_SAVE_SETTINGS, siteId } );

		return wp.req
			.post(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{
					path: '/wp-super-cache/v1/settings',
					body: JSON.stringify( sanitizeSettings( settings ) ),
					json: true,
				}
			)
			.then( ( { data } ) => {
				dispatch( receiveSettings( siteId, normalizeSettings( data ) || {} ) );
				dispatch( { type: WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS, siteId } );
				dispatch( requestStatus( siteId ) );
			} )
			.catch( ( error ) => {
				dispatch( { type: WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE, siteId, error } );
			} );
	};
};

/**
 * Restores settings for a site.
 *
 * @param  {number} siteId Site ID
 * @returns {Function} Action thunk that restores the settings for a given site
 */
export const restoreSettings = ( siteId ) => {
	return ( dispatch, getState ) => {
		dispatch( { type: WP_SUPER_CACHE_RESTORE_SETTINGS, siteId } );
		dispatch( removeNotice( 'wpsc-restore-defaults' ) );

		return wp.req
			.post(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{ path: '/wp-super-cache/v1/settings', body: JSON.stringify( { reset: true } ), json: true }
			)
			.then( ( { data } ) => {
				dispatch( receiveSettings( siteId, normalizeSettings( data ) || {} ) );
				dispatch( { type: WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS, siteId } );
				dispatch(
					successNotice(
						translate( 'Default configuration restored successfully on %(siteTitle)s.', {
							args: { siteTitle: getSiteTitle( getState(), siteId ) },
						} ),
						{ id: 'wpsc-restore-defaults' }
					)
				);
			} )
			.catch( () => {
				dispatch( { type: WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE, siteId } );
				dispatch(
					errorNotice(
						translate(
							'There was a problem restoring the default configuration. Please try again.'
						),
						{ id: 'wpsc-restore-defaults' }
					)
				);
			} );
	};
};
