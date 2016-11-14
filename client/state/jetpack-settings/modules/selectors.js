/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Returns true if the module is activated
 * @param  {Object}  state Global state tree
 * @param  {String}  siteId The ID of the site we're querying
 * @param  {String}  moduleSlug  A module's slug
 * @return {Boolean}       Weather a module is activated
 */
export function isModuleActive( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModules.items, [ siteId, moduleSlug, 'active' ], false );
}

/**
 * Returns true if we are currently making a request to activate a module
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  siteId The ID of the site we're querying
 * @param  {String}  moduleSlug module's slug
 * @return {Boolean}         Whether module is being activated
 */
export function isActivatingModule( state, siteId, moduleSlug ) {
	return get( state.jetpackSettings.jetpackModules.requests, [ siteId, moduleSlug, 'activating' ], false );
}
