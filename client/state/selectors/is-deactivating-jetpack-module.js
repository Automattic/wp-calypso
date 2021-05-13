/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

/**
 * Returns true if we are currently making a request to deactivate a module. False otherwise
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {string}  moduleSlug  Slug of the module
 * @returns {?boolean}            Whether module is currently being deactivated
 */
export default function isDeactivatingJetpackModule( state, siteId, moduleSlug ) {
	return get( state.jetpack.modules.requests, [ siteId, moduleSlug, 'deactivating' ], null );
}
