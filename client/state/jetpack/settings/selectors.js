/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to update the Jetpack settings. False otherwise
 * Returns null if the status for the queried site is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Boolean}            Whether Jetpack settings are currently being updated
 */
export function isUpdatingJetpackSettings( state, siteId ) {
	return get( state.jetpack.settings.requests, [ siteId, 'updating' ], null );
}

/**
 * Returns true if we are currently making a request to regenerate the Post By Email address. False otherwise
 * Returns null if the status for the queried site is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Boolean}            Whether Post by Email address is currently being updated
 */
export function isRegeneratingPostByEmail( state, siteId ) {
	return get( state.jetpack.settings.requests, [ siteId, 'regeneratingPostByEmail' ], null );
}

/**
 * Returns the Jetpack settings on a certain site.
 * Returns null if the site is unknown, or settings have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {?Object}         Jetpack settings
 */
export function getJetpackSettings( state, siteId ) {
	return get( state.jetpack.settings.items, [ siteId ], null );
}

/**
 * Returns a certain Jetpack setting on a specified site.
 * Returns null if the site is unknown, or settings have not been fetched yet.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   The ID of the site we're querying
 * @param  {String}  setting  Name of the setting
 * @return {*}                Value of the Jetpack setting
 */
export function getJetpackSetting( state, siteId, setting ) {
	return get( state.jetpack.settings.items, [ siteId, setting ], null );
}

/**
 * Returns the status of the last Jetpack site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}         The request status (peding, success or error)
 */
export function getJetpackSettingsSaveRequestStatus( state, siteId ) {
	return get( state.jetpack.settings.saveRequests, [ siteId, 'status' ] );
}

/**
 * Returns true fi the save Jetpack site settings requests is successful
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}         Whether the requests is successful or not
 */
export function isJetpackSettingsSaveSuccessful( state, siteId ) {
	return getJetpackSettingsSaveRequestStatus( state, siteId ) === 'success';
}

/**
 * Returns the error returned by the last Jetpack site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}         The request error
 */
export function getJetpackSettingsSaveError( state, siteId ) {
	return get( state.jetpack.settings.saveRequests, [ siteId, 'error' ], false );
}
