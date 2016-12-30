/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are requesting settings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site settings is being requested
 */
export function isRequestingSiteSettings( state, siteId ) {
	return get( state.siteSettings.requesting, [ siteId ], false );
}

/**
 * Returns true if we are saving settings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site settings is being requested
 */
export function isSavingSiteSettings( state, siteId ) {
	return get( state.siteSettings.saveRequests, [ siteId, 'saving' ], false );
}

/**
 * Returns the status of the last site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}         The request status (peding, success or error)
 */
export function getSiteSettingsSaveRequestStatus( state, siteId ) {
	return get( state.siteSettings.saveRequests, [ siteId, 'status' ] );
}

/**
 * Returns the settings for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object}        Site settings
 */
export function getSiteSettings( state, siteId ) {
	return get( state.siteSettings.items, [ siteId ], null );
}

/**
 * Returns true fi the save site settings requests is successful
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}         Whether the requests is successful or not
 */
export function isSiteSettingsSaveSuccessful( state, siteId ) {
	return getSiteSettingsSaveRequestStatus( state, siteId ) === 'success';
}

/**
 * Returns the error returned by the last site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}         The request error
 */
export function getSiteSettingsSaveError( state, siteId ) {
	return get( state.siteSettings.saveRequests, [ siteId, 'error' ], false );
}
