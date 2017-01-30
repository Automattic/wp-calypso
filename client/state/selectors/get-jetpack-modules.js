/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the data for all modules on a certain site.
 * Returns null if the site is unknown, or modules have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {?Object}         Modules data
 */
export default function getJetpackModules( state, siteId ) {
	return get( state.jetpack.modules.items, [ siteId ], null );
}
