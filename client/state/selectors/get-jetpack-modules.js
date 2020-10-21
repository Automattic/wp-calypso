/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

/**
 * Returns the data for all modules on a certain site.
 * Returns null if the site is unknown, or modules have not been fetched yet.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  The ID of the site we're querying
 * @returns {?object}         Modules data
 */
export default function getJetpackModules( state, siteId ) {
	return get( state.jetpack.modules.items, [ siteId ], null );
}
