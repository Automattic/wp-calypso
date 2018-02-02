/** @format */

/**
 * External dependencies
 */
import { map, pick, zipObject } from 'lodash';

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
	},
	inviteItemsSchema
);

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
	}
);

/**
 * Returns the updated site invites resend requests state after an action has been
 * dispatched. The state reflects an object keyed by site ID, consisting of requested
 * resend invite IDs, with a boolean representing request status.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requestingResend( state = {}, action ) {
	switch ( action.type ) {
		case INVITE_RESEND_REQUEST:
			const requestingActions = Object.assign( {}, state[ action.siteId ], {
				[ action.inviteId ]: 'requesting',
			} );
			return Object.assign( {}, state, { [ action.siteId ]: requestingActions } );
		case INVITE_RESEND_REQUEST_SUCCESS:
			const successActions = Object.assign( {}, state[ action.siteId ], {
				[ action.inviteId ]: 'success',
			} );
			return Object.assign( {}, state, { [ action.siteId ]: successActions } );
		case INVITE_RESEND_REQUEST_FAILURE: {
			const failureActions = Object.assign( {}, state[ action.siteId ], {
				[ action.inviteId ]: 'failure',
			} );
			return Object.assign( {}, state, { [ action.siteId ]: failureActions } );
		}
	}

	return state;
}

export function deleting( state = {}, action ) {
	switch ( action.type ) {
		case INVITES_DELETE_REQUEST:
		case INVITES_DELETE_REQUEST_FAILURE:
		case INVITES_DELETE_REQUEST_SUCCESS:
			const inviteMap = zipObject(
				action.inviteIds,
				map( action.inviteIds, () => INVITES_DELETE_REQUEST === action.type )
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteMap } );
	}

	return state;
}

export default combineReducers( { requesting, items, counts, requestingResend, deleting } );
