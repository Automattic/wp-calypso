/** @format */

/**
 * External dependencies
 */
import { get, find, indexOf, values } from 'lodash';

/**
 * Internal dependencies
 */
import treeSelect from 'lib/tree-select';

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
 * Returns an array of all pending invite objects known for the given site, or
 * `null` if there is no data for that site.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {?Array}        The list of pending invites for the given site
 */
export function getPendingInvitesForSite( state, siteId ) {
	const invites = state.invites.items[ siteId ];
	if ( ! invites ) {
		return null;
	}
	return invites.pending;
}

/**
 * Returns an array of all accepted invite objects known for the given site, or
 * `null` if there is no data for that site.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {?Array}        The list of accepted invites for the given site
 */
export function getAcceptedInvitesForSite( state, siteId ) {
	const invites = state.invites.items[ siteId ];
	if ( ! invites ) {
		return null;
	}
	return invites.accepted;
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
 * Returns an invite object for the given site and invite ID, or `null` if no
 * invite with the given ID exists for the site.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  inviteId Invite ID
 * @return {?Object}          Invite object (if found)
 */
export const getInviteForSite = treeSelect(
	( state, siteId ) => [ state.invites.items[ siteId ] ],
	( [ siteInvites ], siteId, inviteId ) => {
		if ( ! siteInvites ) {
			return null;
		}
		return (
			find( siteInvites.pending, { key: inviteId } ) ||
			find( siteInvites.accepted, { key: inviteId } ) ||
			null
		);
	}
);

/**
 * Returns true if currently requesting an invite resend for the given site and
 * invite ID, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  inviteId Invite ID
 * @return {Boolean}          Whether invites resend is being requested
 */
export function isRequestingInviteResend( state, siteId, inviteId ) {
	return 'requesting' === get( state, [ 'invites', 'requestingResend', siteId, inviteId ], false );
}

/**
 * Returns true if request to resend invite for the given site and
 * invite ID was successful, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  inviteId Invite ID
 * @return {Boolean}          Whether invite resend was a success
 */
export function didInviteResendSucceed( state, siteId, inviteId ) {
	return 'success' === get( state, [ 'invites', 'requestingResend', siteId, inviteId ], false );
}

/**
 * Returns true if currently deleting an invite for the given site and
 * invite ID, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  inviteId Invite ID
 * @return {Boolean}          Whether invites resend is being requested
 */
export function isDeletingInvite( state, siteId, inviteId ) {
	return 'requesting' === get( state, [ 'invites', 'deleting', siteId, inviteId ], false );
}

/**
 * Returns true if the invite for the given site and invite ID was successfully
 * deleted, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  inviteId Invite ID
 * @return {Boolean}          Whether invites resend is being requested
 */
export function didInviteDeletionSucceed( state, siteId, inviteId ) {
	return 'success' === get( state, [ 'invites', 'deleting', siteId, inviteId ], false );
}

/**
 * Returns true if currently deleting any invite for the given site,
 * or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID

 * @return {Boolean}          Whether an invite is being deleted
 */
export function isDeletingAnyInvite( state, siteId ) {
	return (
		-1 !== indexOf( values( get( state, [ 'invites', 'deleting', siteId ], {} ) ), 'requesting' )
	);
}
