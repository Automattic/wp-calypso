/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the Jetpack settings on a certain site.
 * Returns null if the site is unknown, or settings have not been fetched yet.
 *
 * @param  {object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {?object}         Jetpack settings
 */
export default function getJetpackSettings( state, siteId ) {
	return get( state.jetpack.settings, [ siteId ], null );
}
