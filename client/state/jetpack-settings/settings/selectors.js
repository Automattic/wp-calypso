/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to fetch the Jetpack settings. False otherwise
 * Returns null if the status for the queried site is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Boolean}            Whether Jetpack settings are currently being requested
 */
export function isRequestingJetpackSettings( state, siteId ) {
	return get( state.jetpackSettings.settings.requests, [ siteId, 'requesting' ], null );
}

/**
 * Returns true if we are currently making a request to update the Jetpack settings. False otherwise
 * Returns null if the status for the queried site is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Boolean}            Whether Jetpack settings are currently being updated
 */
export function isUpdatingJetpackSettings( state, siteId ) {
	return get( state.jetpackSettings.settings.requests, [ siteId, 'updating' ], null );
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
	return get( state.jetpackSettings.settings.items, [ siteId ], null );
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
	return get( state.jetpackSettings.settings.items, [ siteId, setting ], null );
}
