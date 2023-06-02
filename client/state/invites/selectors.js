import treeSelect from '@automattic/tree-select';
import { get, find } from 'lodash';

import 'calypso/state/invites/init';

/**
 * Returns true if currently requesting invites for the given site, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether invites are being requested
 */
export function isRequestingInvitesForSite( state, siteId ) {
	return !! state.invites.requesting[ siteId ];
}

/**
 * Returns an array of all pending invite objects known for the given site, or
 * `null` if there is no data for that site.
 *
 * @param  {Object} state  Global state tree
 * @param  {number} siteId Site ID
 * @returns {?Array}        The list of pending invites for the given site
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
 * @param  {number} siteId Site ID
 * @returns {?Array}        The list of accepted invites for the given site
 */
export function getAcceptedInvitesForSite( state, siteId ) {
	const invites = state.invites.items[ siteId ];
	if ( ! invites ) {
		return null;
	}
	return invites.accepted;
}

/**
 * Returns an array of all invite links for the given site, or
 * `null` if there are none.
 *
 * @param  {Object} state  Global state tree
 * @param  {number} siteId Site ID
 * @returns {?Array}       The list of invite links for the given site
 */
export function getInviteLinksForSite( state, siteId ) {
	const inviteLinks = state.invites.links[ siteId ];
	if ( ! inviteLinks ) {
		return null;
	}
	return inviteLinks;
}

/**
 * Returns the total number of invites found for the given site, or `null`.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?number}        The number of invites found for the given site
 */
export function getNumberOfInvitesFoundForSite( state, siteId ) {
	return state.invites.counts[ siteId ] || null;
}

/**
 * Returns an invite object for the given site and invite ID, or `null` if no
 * invite with the given ID exists for the site.
 *
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  inviteId Invite ID
 * @returns {?Object}          Invite object (if found)
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
 * @param  {number}  siteId   Site ID
 * @param  {string}  inviteId Invite ID
 * @returns {boolean}          Whether invites resend is being requested
 */
export function isRequestingInviteResend( state, siteId, inviteId ) {
	return 'requesting' === get( state, [ 'invites', 'requestingResend', siteId, inviteId ], false );
}

/**
 * Returns true if request to resend invite for the given site and
 * invite ID was successful, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  inviteId Invite ID
 * @returns {boolean}          Whether invite resend was a success
 */
export function didInviteResendSucceed( state, siteId, inviteId ) {
	return 'success' === get( state, [ 'invites', 'requestingResend', siteId, inviteId ], false );
}

/**
 * Returns true if currently deleting an invite for the given site and
 * invite ID, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  inviteId Invite ID
 * @returns {boolean}          Whether invites resend is being requested
 */
export function isDeletingInvite( state, siteId, inviteId ) {
	return 'requesting' === get( state, [ 'invites', 'deleting', siteId, inviteId ], false );
}

/**
 * Returns true if the invite for the given site and invite ID was successfully
 * deleted, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  inviteId Invite ID
 * @returns {boolean}          Whether invites resend is being requested
 */
export function didInviteDeletionSucceed( state, siteId, inviteId ) {
	return 'success' === get( state, [ 'invites', 'deleting', siteId, inviteId ], false );
}

/**
 * Returns true if currently deleting any invite for the given site,
 * or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @returns {boolean}          Whether an invite is being deleted
 */
export function isDeletingAnyInvite( state, siteId ) {
	return (
		-1 !==
		Object.values( get( state, [ 'invites', 'deleting', siteId ], {} ) ).indexOf( 'requesting' )
	);
}

/**
 * Returns token validation object
 *
 * @param {Object} 	state	Global state tree
 */
export function getTokenValidation( state ) {
	return state.invites.validation;
}

/**
 * Returns send invite state object
 *
 * @param {Object} 	state	Global state tree
 */
export function getSendInviteState( state ) {
	return state.invites.inviting;
}
