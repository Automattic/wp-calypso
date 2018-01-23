/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if currently requesting invites for the given site, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether invites are being requested
 */
export function isRequestingInvitesForSite( state, siteId ) {
	return !! state.invites.requesting[ siteId ];
}

/**
 * Returns an array of all invite objects known for the given site, or `null`
 * if there is no data for that site.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Array}         The list of invite objects for the given site
 */
export function getInvitesForSite( state, siteId ) {
	const invites = state.invites.items[ siteId ];
	if ( ! invites ) {
		return null;
	}
	return invites;
}

/**
 * Returns true if currently requesting an invite resend for the given site and
 * invite ID, or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  inviteId Invite ID
 * @return {Boolean}        Whether invites are being requested
 */
export function isRequestingInviteResend( state, siteId, inviteId ) {
	return get( state, [ 'invites', 'requestingInviteResend', siteId, inviteId ], false );
}
