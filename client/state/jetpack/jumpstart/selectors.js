/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to deactivate Jumpstart. False otherwise
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Boolean}            Whether Jumpstart is currently being deactivated
 */
export function isDeactivatingJumpstart( state, siteId ) {
	return get( state.jetpack.jetpackJumpstart.requests, [ siteId, 'deactivating' ], null );
}

/**
 * Returns true if we are currently making a request to retrieve the current Jumpstart status. False otherwise.
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {Object}   state    Global state tree
 * @param  {Number}   siteId   The ID of the site we're querying
 * @return {?Boolean}          Whether the Jumpstart status is being requested
 */
export function isRequestingJumpstartStatus( state, siteId ) {
	return get( state.jetpack.jetpackJumpstart.requests, [ siteId, 'requesting' ], null );
}

/**
 * Returns the current status of Jumpstart.
 * Returns null if the site is unknown, or status hasn't been received yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?String}             Whether Jumpstart is active
 */
export function getJumpstartStatus( state, siteId ) {
	return get( state.jetpack.jetpackJumpstart.items, [ siteId ], null );
}
