/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

/**
 * Returns the Jetpack settings on a certain site.
 * Returns null if the site is unknown, or settings have not been fetched yet.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  The ID of the site we're querying
 * @returns {?object}         Jetpack settings
 */
export default function getJetpackSettings( state, siteId ) {
	return get( state.jetpack.settings, [ siteId ], null );
}
