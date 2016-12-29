/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to fetch the settings of a module. False otherwise
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether module settings are currently being requested
 */
export function isRequestingModuleSettings( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModuleSettings.requests, [ siteId, moduleSlug, 'requesting' ], null );
}

/**
 * Returns true if we are currently making a request to update the settings of a module. False otherwise
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether module settings are currently being updated
 */
export function isUpdatingModuleSettings( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModuleSettings.requests, [ siteId, moduleSlug, 'updating' ], null );
}

/**
 * Returns the settings for all modules on a certain site.
 * Returns null if the site is unknown, or modules have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {?Object}         Modules settings
 */
export function getModulesSettings( state, siteId ) {
	return get( state.jetpackSettings.jetpackModuleSettings.items, [ siteId ], null );
}

/**
 * Returns the settings for a specified module on a certain site.
 * Returns null if the site or module is unknown, or modules have not been fetched yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Object}             Module data
 */
export function getModuleSettings( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModuleSettings.items, [ siteId, moduleSlug ], null );
}
