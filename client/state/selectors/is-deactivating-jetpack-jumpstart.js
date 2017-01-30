/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to deactivate Jumpstart. False otherwise
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Boolean}            Whether Jumpstart is currently being deactivated
 */
export default function isDeactivatingJetpackJumpstart( state, siteId ) {
	return get( state.jetpack.jumpstart.requests, [ siteId, 'deactivating' ], null );
}
