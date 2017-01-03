/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to retrieve the connection status. False otherwise.
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {Object}   state    Global state tree
 * @param  {Number}   siteId   The ID of the site we're querying
 * @return {?Boolean}          Whether the connection status is being requested
 */
export function isRequestingJetpackConnectionStatus( state, siteId ) {
	return get( state.jetpackSettings.jetpackConnection.requests, [ siteId ], null );
}

/**
 * Returns the current status of the connection.
 * Returns null if the site is unknown, or status hasn't been received yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Object}             Details about connection status
 */
export function getJetpackConnectionStatus( state, siteId ) {
	return get( state.jetpackSettings.jetpackConnection.items, [ siteId ], null );
}

/**
 * Returns true if we the Jetpack site is in development mode. False otherwise.
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {Object}   state    Global state tree
 * @param  {Number}   siteId   The ID of the site we're querying
 * @return {?Boolean}          Whether the site is in development mode.
 */
export function isJetpackSiteInDevelopmentMode( state, siteId ) {
	return get( getJetpackConnectionStatus( state, siteId ), [ 'devMode', 'isActive' ], null );
}

/**
 * Returns true if we the Jetpack site is in staging mode. False otherwise.
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {Object}   state    Global state tree
 * @param  {Number}   siteId   The ID of the site we're querying
 * @return {?Boolean}          Whether the site is in staging mode.
 */
export function isJetpackSiteInStagingMode( state, siteId ) {
	return get( getJetpackConnectionStatus( state, siteId ), [ 'isStaging' ], null );
}
