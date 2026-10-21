import wpcom from 'calypso/lib/wp';
import {
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
	SITE_SETTINGS_UPDATE,
} from 'calypso/state/action-types';
import { requestSite, receiveSiteFrontPage } from 'calypso/state/sites/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { requestAdminMenu } from '../admin-menu/actions';
import { normalizeSettings } from './utils';
import 'calypso/state/site-settings/init';
import 'calypso/state/ui/init';

/**
 * Returns an action object to be used in signalling that site settings have been received.
 * @param  {number} siteId Site ID
 * @param  {Object} settings The site settings object
 * @returns {Object}        Action object
 */
export function receiveSiteSettings( siteId, settings ) {
	return {
		type: SITE_SETTINGS_RECEIVE,
		siteId,
		settings,
	};
}

/**
 * Returns an action object to be used in signalling that some site settings have been update.
 * @param  {number} siteId Site ID
 * @param  {Object} settings The updated site settings
 * @returns {Object}        Action object
 */
export function updateSiteSettings( siteId, settings ) {
	return {
		type: SITE_SETTINGS_UPDATE,
		siteId,
		settings,
	};
}

/**
 * Normalizes the `hide_free_tier` flag to 1/0. This payload is form-encoded, so
 * a JS boolean would arrive as the string "true"/"false" — and PHP treats any
 * non-empty string (including "false") as truthy. Coercing to 1/0 keeps the
 * value unambiguous on the wire regardless of what a caller passes in.
 * @param {*} value The raw flag value (boolean, number, or string).
 * @returns {number} 1 for truthy values; 0 for falsy values, including the
 *                   stringy falsy forms '', '0', and 'false'.
 */
function normalizeHideFreeTier( value ) {
	if ( typeof value === 'string' ) {
		const normalized = value.trim().toLowerCase();
		return normalized === '' || normalized === '0' || normalized === 'false' ? 0 : 1;
	}
	return value ? 1 : 0;
}

/**
 * Formats subscription_options to match the expected server format
 * @param {Object} settings The settings object
 * @param {number} siteId The site ID
 * @param {Object} state The Redux state
 * @returns {Object} The formatted settings object
 */
function formatSubscriptionOptions( settings, siteId, state ) {
	if ( ! settings?.subscription_options || ! isJetpackSite( state, siteId ) ) {
		return settings;
	}

	const allowedKeys = [
		'invitation',
		'comment_follow',
		'welcome',
		'free_tier_description',
		'hide_free_tier',
	];
	// Send a plain object keyed by name. The server filters subscription_options
	// by key (`invitation`, `welcome`, ...), so the keys must survive the wire.
	// A JS array would not: the request crosses a postMessage/JSON boundary
	// (wpcom-proxy-request), which drops an array's non-index string properties,
	// leaving the server an integer-keyed list it filters out entirely — which is
	// why Jetpack/Atomic saves silently no-op. Filtering to allowedKeys (the part
	// that actually fixed the original Atomic save bug) is preserved.
	const formattedOptions = {};
	Object.entries( settings.subscription_options ).forEach( ( [ key, value ] ) => {
		if ( allowedKeys.includes( key ) ) {
			formattedOptions[ key ] = key === 'hide_free_tier' ? normalizeHideFreeTier( value ) : value;
		}
	} );

	return {
		...settings,
		subscription_options: formattedOptions,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve site settings
 * @param  {number} siteId Site ID
 * @returns {Function}      Action thunk
 */
export function requestSiteSettings( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_SETTINGS_REQUEST,
			siteId,
		} );

		return wpcom.req
			.get( `/sites/${ siteId }/settings`, { apiVersion: '1.4' } )
			.then( ( { name, description, settings } ) => {
				const savedSettings = {
					...normalizeSettings( settings ),
					blogname: name,
					blogdescription: description,
				};

				dispatch( receiveSiteSettings( siteId, savedSettings ) );
				dispatch( receiveSiteOptions( siteId, savedSettings ) );
				dispatch( {
					type: SITE_SETTINGS_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_SETTINGS_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

export function saveSiteSettings( siteId, settings = {} ) {
	return ( dispatch, getState ) => {
		dispatch( {
			type: SITE_SETTINGS_SAVE,
			siteId,
		} );

		const formattedSettings = formatSubscriptionOptions( settings, siteId, getState() );

		return wpcom.req
			.post( '/sites/' + siteId + '/settings', { apiVersion: '1.4' }, formattedSettings )
			.then( ( body ) => {
				dispatch( updateSiteSettings( siteId, normalizeSettings( body.updated ) ) );
				dispatch( {
					type: SITE_SETTINGS_SAVE_SUCCESS,
					siteId,
				} );
				dispatch( requestSite( siteId ) );
				dispatch( requestAdminMenu( siteId ) );
				return body;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_SETTINGS_SAVE_FAILURE,
					siteId,
					error,
				} );

				return error;
			} );
	};
}

export function receiveSiteOptions( siteId, settings ) {
	return ( dispatch ) => {
		dispatch( receiveSiteFrontPage( siteId, settings ) );
	};
}
