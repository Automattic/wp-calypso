/** @format */

/**
 * External dependencies
 */
import { includes, map, pick, zipObject } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	INVITES_DELETE_REQUEST,
	INVITES_DELETE_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST_SUCCESS,
	INVITES_REQUEST,
	INVITES_REQUEST_FAILURE,
	INVITES_REQUEST_SUCCESS,
	INVITE_RESEND_REQUEST,
	INVITE_RESEND_REQUEST_FAILURE,
	INVITE_RESEND_REQUEST_SUCCESS,
} from 'state/action-types';
import { inviteItemsSchema } from './schema';

/**
 * Returns the updated site invites requests state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean reflecting
 * whether a request for the post is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case INVITES_REQUEST:
		case INVITES_REQUEST_SUCCESS:
		case INVITES_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: INVITES_REQUEST === action.type,
			} );
	}

	return state;
}

/**
 * Tracks all known invite objects as an object indexed by site ID and
 * containing arrays of invites.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer(
	{},
	{
		[ INVITES_REQUEST_SUCCESS ]: ( state, action ) => {
			// Invites are returned from the API in descending order by
			// `invite_date`, which is what we want here.

			const siteInvites = { pending: [], accepted: [] };
			action.invites.forEach( invite => {
				// Not renaming `avatar_URL` because it is used as-is by <Gravatar>
				const user = pick( invite.user, 'login', 'email', 'name', 'avatar_URL' );
				const invitedBy = pick( invite.invited_by, 'name', 'login', 'avatar_URL' );
				const inviteForState = {
					key: invite.invite_key,
					role: invite.role,
					isPending: invite.is_pending,
					inviteDate: invite.invite_date,
					acceptedDate: invite.accepted_date,
					user,
					invitedBy,
				};

				if ( inviteForState.isPending ) {
					siteInvites.pending.push( inviteForState );
				} else {
					siteInvites.accepted.push( inviteForState );
				}
			} );

			return {
				...state,
				[ action.siteId ]: siteInvites,
			};
		},
		[ INVITES_DELETE_REQUEST_SUCCESS ]: ( state, action ) => {
			return {
				...state,
				[ action.siteId ]: {
					accepted: deleteInvites( state[ action.siteId ].accepted, action.inviteIds ),
					pending: deleteInvites( state[ action.siteId ].pending, action.inviteIds ),
				},
			};
		},
	},
	inviteItemsSchema
);

/**
 * Returns an array of site invites, without the deleted invite objects.
 *
 * @param  {Array} siteInvites      Array of invite objects.
 * @param  {Array} invitesToDelete  Array of invite keys to remove.
 * @return {Array}                  Updated array of invite objects.
 */
function deleteInvites( siteInvites, invitesToDelete ) {
	return siteInvites.filter( siteInvite => ! includes( invitesToDelete, siteInvite.key ) );
}

/**
 * Tracks the total number of invites the API says a given siteId has.
 * This count can be greater than the number of invites queried.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const counts = createReducer(
	{},
	{
		[ INVITES_REQUEST_SUCCESS ]: ( state, action ) => {
			return {
				...state,
				[ action.siteId ]: action.found,
			};
		},
		[ INVITES_DELETE_REQUEST_SUCCESS ]: ( state, action ) => {
			return {
				...state,
				[ action.siteId ]: state[ action.siteId ] - action.inviteIds.length,
			};
		},
	}
);

/**
 * Returns the updated site invites resend requests state after an action has been
 * dispatched. The state reflects an object keyed by site ID, consisting of requested
 * resend invite IDs, with a string representing request status.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requestingResend( state = {}, action ) {
	switch ( action.type ) {
		case INVITE_RESEND_REQUEST:
			const inviteResendRequests = Object.assign( {}, state[ action.siteId ], {
				[ action.inviteId ]: 'requesting',
			} );
			return Object.assign( {}, state, { [ action.siteId ]: inviteResendRequests } );
		case INVITE_RESEND_REQUEST_SUCCESS:
			const inviteResendSuccesses = Object.assign( {}, state[ action.siteId ], {
				[ action.inviteId ]: 'success',
			} );
			return Object.assign( {}, state, { [ action.siteId ]: inviteResendSuccesses } );
		case INVITE_RESEND_REQUEST_FAILURE: {
			const inviteResendFailures = Object.assign( {}, state[ action.siteId ], {
				[ action.inviteId ]: 'failure',
			} );
			return Object.assign( {}, state, { [ action.siteId ]: inviteResendFailures } );
		}
	}

	return state;
}

/**
 * Returns the updated site invites deletion requests state after an action has been
 * dispatched. The state reflects an object keyed by site ID, consisting of requested
 * invite IDs to delete, with a string representing request status.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function deleting( state = {}, action ) {
	switch ( action.type ) {
		case INVITES_DELETE_REQUEST:
			const inviteDeletionRequests = Object.assign(
				{},
				state[ action.siteId ],
				zipObject( action.inviteIds, map( action.inviteIds, () => 'requesting' ) )
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionRequests } );
		case INVITES_DELETE_REQUEST_FAILURE:
			const inviteDeletionFailures = Object.assign(
				{},
				state[ action.siteId ],
				zipObject( action.inviteIds, map( action.inviteIds, () => 'failure' ) )
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionFailures } );
		case INVITES_DELETE_REQUEST_SUCCESS:
			const inviteDeletionSuccesses = Object.assign(
				{},
				state[ action.siteId ],
				zipObject( action.inviteIds, map( action.inviteIds, () => 'success' ) )
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionSuccesses } );
	}

	return state;
}

export default combineReducers( { requesting, items, counts, requestingResend, deleting } );
