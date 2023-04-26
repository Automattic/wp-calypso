import { get } from 'lodash';

import 'calypso/state/jetpack/init';

/**
 * Returns the data for a specified module on a certain site.
 * Returns null if the site or module is unknown, or modules have not been fetched yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {string}  moduleSlug  Slug of the module
 * @returns {?Object}             Module data
 */
export default function getJetpackModule( state, siteId, moduleSlug ) {
	return get( state.jetpack.modules.items, [ siteId, moduleSlug ], null );
}
