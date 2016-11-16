/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Returns true if the module is currently active.
 * @param  {Object}  state       Global state tree
 * @param  {String}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether the module is active
 */
export function isModuleActive( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModules.items, [ siteId, moduleSlug, 'active' ], null );
}

/**
 * Returns true if we are currently making a request to activate a module.
 *
 * @param  {Object}  state       Global state tree
 * @param  {String}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether module is currently being activated
 */
export function isActivatingModule( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModules.requests, [ siteId, moduleSlug, 'activating' ], null );
}

/**
 * Returns true if we are currently making a request to deactivate a module.
 *
 * @param  {Object}  state       Global state tree
 * @param  {String}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether module is currently being deactivated
 */
export function isDeactivatingModule( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModules.requests, [ siteId, moduleSlug, 'deactivating' ], null );
}
