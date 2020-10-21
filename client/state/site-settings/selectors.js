/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/site-settings/init';

/**
 * Returns true if we are requesting settings for the specified site ID, false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site settings is being requested
 */
export function isRequestingSiteSettings( state, siteId ) {
	return get( state.siteSettings.requesting, [ siteId ], false );
}

/**
 * Returns true if we are saving settings for the specified site ID, false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site settings is being requested
 */
export function isSavingSiteSettings( state, siteId ) {
	return get( state.siteSettings.saveRequests, [ siteId, 'saving' ], false );
}

/**
 * Returns the status of the last site settings save request
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {string}         The request status (peding, success or error)
 */
export function getSiteSettingsSaveRequestStatus( state, siteId ) {
	return get( state.siteSettings.saveRequests, [ siteId, 'status' ] );
}

/**
 * Returns the settings for the specified site ID
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {object}        Site settings
 */
export function getSiteSettings( state, siteId ) {
	return get( state.siteSettings.items, [ siteId ], null );
}

/**
 * Returns true fi the save site settings requests is successful
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}         Whether the requests is successful or not
 */
export function isSiteSettingsSaveSuccessful( state, siteId ) {
	return getSiteSettingsSaveRequestStatus( state, siteId ) === 'success';
}

/**
 * Returns the error returned by the last site settings save request
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {string}         The request error
 */
export function getSiteSettingsSaveError( state, siteId ) {
	return get( state.siteSettings.saveRequests, [ siteId, 'error' ], false );
}
