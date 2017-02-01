/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current status of Jetpack Jumpstart.
 * Returns null if the site is unknown, or status hasn't been received yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?String}             Whether Jumpstart is active
 */
export default function getJetpackJumpstartStatus( state, siteId ) {
	return get( state.jetpack.jumpstart.items, [ siteId ], null );
}
