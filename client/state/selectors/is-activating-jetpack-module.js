/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to activate a module. False otherwise
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Slug of the module
 * @return {?Boolean}            Whether module is currently being activated
 */
export default function isActivatingJetpackModule( state, siteId, moduleSlug ) {
	return get( state.jetpack.modules.requests, [ siteId, moduleSlug, 'activating' ], null );
}
