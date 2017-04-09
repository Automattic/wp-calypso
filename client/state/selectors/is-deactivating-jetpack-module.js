/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to deactivate a module. False otherwise
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether module is currently being deactivated
 */
export default function isDeactivatingJetpackModule( state, siteId, moduleSlug ) {
	return get( state.jetpack.modules.requests, [ siteId, moduleSlug, 'deactivating' ], null );
}
