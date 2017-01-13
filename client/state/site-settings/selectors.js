/**
 * External dependencies
 */
import { every, get, some } from 'lodash';

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
	return some( get( state.siteSettings.saveRequests, [ siteId ] ), ( request ) => request.saving );
}

/**
 * Returns true if we the save settings request for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  id     Save Request id
 * @return {Boolean}        Whether the site settings request is being requested
 */
export function isSavingSiteSettingsRequest( state, siteId, id = 'default' ) {
	return get( state.siteSettings.saveRequests, [ siteId, id, 'saving' ] );
}

/**
 * Returns the status of the last site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  id     Save Request id
 * @return {String}         The request status (peding, success or error)
 */
export function getSiteSettingsSaveRequestStatus( state, siteId, id = 'default' ) {
	return get( state.siteSettings.saveRequests, [ siteId, id, 'status' ] );
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
 * Returns true fi the all save site settings requests are successful
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether the requests are successful or not
 */
export function isSiteSettingsSaveSuccessful( state, siteId ) {
	return every( get( state.siteSettings.saveRequests, [ siteId ] ), ( request ) => request.status === 'success' );
}

/**
 * Returns true fi the save site settings requests is successful
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  id     Save Request id
 * @return {Boolean}        Whether the request is successful or not
 */
export function isSiteSettingsSaveRequestSuccessful( state, siteId, id = 'default' ) {
	return getSiteSettingsSaveRequestStatus( state, siteId, id ) === 'success';
}

/**
 * Returns the error returned by the last site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  id     Save Request id
 * @return {String}         The request error
 */
export function getSiteSettingsSaveError( state, siteId, id = 'default' ) {
	return get( state.siteSettings.saveRequests, [ siteId, id, 'error' ], false );
}
