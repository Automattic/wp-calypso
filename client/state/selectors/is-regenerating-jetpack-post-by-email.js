/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to regenerate the Post By Email address. False otherwise
 * Returns null if the status for the queried site is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Boolean}            Whether Post by Email address is currently being updated
 */
export default function isRegeneratingJetpackPostByEmail( state, siteId ) {
	return get( state.jetpack.settings.requests, [ siteId, 'regeneratingPostByEmail' ], null );
}
