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
export default function isJetpackModuleActive( state, siteId, moduleSlug ) {
	return get( state.jetpack.modules.items, [ siteId, moduleSlug, 'active' ], null );
}
