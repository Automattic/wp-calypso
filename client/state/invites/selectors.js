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
 * Returns the total number of invites found for the given site, or `null`.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Number}        The number of invites found for the given site
 */
export function getNumberOfInvitesFoundForSite( state, siteId ) {
	return state.invites.counts[ siteId ] || null;
}

/**
 * Returns true if currently requesting an invite resend for the given site and
 * invite ID, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  inviteId Invite ID
 * @return {Boolean}          Whether invites resend is being requested
 */
export function isRequestingResend( state, siteId, inviteId ) {
	return get( state, [ 'invites', 'requestingResend', siteId, inviteId ], false );
}
