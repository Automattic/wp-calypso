/** @format */

/**
 * External dependencies
 */
import { get, find } from 'lodash';

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

/*
 * Returns an invite object for the given site and invite ID, or false otherwise.
 *
 * TODO: searching the object can probably be done in a cleaner manner.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  inviteId Invite ID
 * @return {Object}           Invite object
 */
export const getSelectedInvite = treeSelect(
	( state, siteId ) => [ state.invites.items[ siteId ] ],
	( [ siteInvites ], siteId, inviteId ) => {
		return find( siteInvites, { key: inviteId } );
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
export function isRequestingResend( state, siteId, inviteId ) {
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
export function didResendSucceed( state, siteId, inviteId ) {
	return 'success' === get( state, [ 'invites', 'requestingResend', siteId, inviteId ], false );
}
