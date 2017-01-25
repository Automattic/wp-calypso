/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to get the list of Jetpack
 * modules on the site. False otherwise.
 * Returns null if the status for queried site and module is unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId The ID of the site we're querying
 * @return {?Boolean}         Whether the list is being requested
 */
export function isFetchingModules( state, siteId ) {
	return get( state.jetpack.jetpackModules.requests, [ siteId, 'fetchingModules' ], null );
}

/**
 * Returns the data for all modules on a certain site.
 * Returns null if the site is unknown, or modules have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {?Object}         Modules data
 */
export function getModules( state, siteId ) {
	return get( state.jetpack.jetpackModules.items, [ siteId ], null );
}

/**
 * Returns the data for a specified module on a certain site.
 * Returns null if the site or module is unknown, or modules have not been fetched yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Object}             Module data
 */
export function getModule( state, siteId, moduleSlug ) {
	return get( state.jetpack.jetpackModules.items, [ siteId, moduleSlug ], null );
}
