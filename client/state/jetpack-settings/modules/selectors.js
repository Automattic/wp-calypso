/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if the module is currently active. False otherwise.
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether the module is active
 */
export function isModuleActive( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModules.items, [ siteId, moduleSlug, 'active' ], null );
}

/**
 * Returns true if we are currently making a request to activate a module. False otherwise
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether module is currently being activated
 */
export function isActivatingModule( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModules.requests, [ siteId, moduleSlug, 'activating' ], null );
}

/**
 * Returns true if we are currently making a request to deactivate a module. False otherwise
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether module is currently being deactivated
 */
export function isDeactivatingModule( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModules.requests, [ siteId, moduleSlug, 'deactivating' ], null );
}

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
	return get( state.jetpackSettings.jetpackModules.requests, [ siteId, 'fetchingModules' ], null );
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
	return get( state.jetpackSettings.jetpackModules.items, [ siteId ], null );
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
	return get( state.jetpackSettings.jetpackModules.items, [ siteId, moduleSlug ], null );
}
