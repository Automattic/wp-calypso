import { withStorageKey } from '@automattic/state-utils';
import { includes, pick } from 'lodash';
import moment from 'moment';
import {
	INVITES_DELETE_REQUEST,
	INVITES_DELETE_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST_SUCCESS,
	INVITES_REQUEST,
	INVITES_REQUEST_FAILURE,
	INVITES_REQUEST_SUCCESS,
	INVITES_SEND,
	INVITES_SEND_ERROR,
	INVITES_SEND_FAILURE,
	INVITES_SEND_SUCCESS,
	INVITES_VALIDATE_TOKEN,
	INVITES_VALIDATE_TOKEN_FAILURE,
	INVITES_VALIDATE_TOKEN_SUCCESS,
	INVITE_RESEND_REQUEST,
	INVITE_RESEND_REQUEST_FAILURE,
	INVITE_RESEND_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { inviteItemsSchema, inviteLinksSchema } from './schema';

/**
 * Returns the updated site invites requests state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean reflecting
 * whether a request for the post is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
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
 * @returns {Object}        Updated state
 */
export const items = withSchemaValidation( inviteItemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case INVITES_REQUEST_SUCCESS: {
			// Invites are returned from the API in descending order by
			// `invite_date`, which is what we want here.

			const siteInvites = { pending: [], accepted: [] };
			action.invites.forEach( ( invite ) => {
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
		}
		case INVITES_DELETE_REQUEST_SUCCESS: {
			return {
				...state,
				[ action.siteId ]: {
					accepted: deleteInvites( state[ action.siteId ].accepted, action.inviteIds ),
					pending: deleteInvites( state[ action.siteId ].pending, action.inviteIds ),
				},
			};
		}
	}

	return state;
} );

export const links = withSchemaValidation( inviteLinksSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case INVITES_REQUEST_SUCCESS: {
			let inviteLinks = {};
			const currentDate = moment();
			Object.values( action.links ).forEach( ( link ) => {
				// Do not process expired links
				if ( link.expiry && currentDate.isAfter( link.expiry * 1000 ) ) {
					return;
				}
				const linkForState = {
					key: link.invite_key,
					link: link.link,
					role: link.role,
					inviteDate: link.invite_date,
					expiry: link.expiry,
				};

				inviteLinks = {
					...inviteLinks,
					[ link.role ]: linkForState,
				};
			} );

			return {
				...state,
				[ action.siteId ]: inviteLinks,
			};
		}
	}

	return state;
} );

/**
 * Returns an array of site invites, without the deleted invite objects.
 *
 * @param  {Array} siteInvites      Array of invite objects.
 * @param  {Array} invitesToDelete  Array of invite keys to remove.
 * @returns {Array}                  Updated array of invite objects.
 */
function deleteInvites( siteInvites, invitesToDelete ) {
	return siteInvites.filter( ( siteInvite ) => ! includes( invitesToDelete, siteInvite.key ) );
}

/**
 * Tracks the total number of invites the API says a given siteId has.
 * This count can be greater than the number of invites queried.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const counts = ( state = {}, action ) => {
	switch ( action.type ) {
		case INVITES_REQUEST_SUCCESS: {
			return {
				...state,
				[ action.siteId ]: action.found,
			};
		}
		case INVITES_DELETE_REQUEST_SUCCESS: {
			return {
				...state,
				[ action.siteId ]: state[ action.siteId ] - action.inviteIds.length,
			};
		}
	}

	return state;
};

/**
 * Returns the updated site invites resend requests state after an action has been
 * dispatched. The state reflects an object keyed by site ID, consisting of requested
 * resend invite IDs, with a string representing request status.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function requestingResend( state = {}, action ) {
	switch ( action.type ) {
		case INVITE_RESEND_REQUEST: {
			const inviteResendRequests = Object.assign( {}, state[ action.siteId ], {
				[ action.inviteId ]: 'requesting',
			} );
			return Object.assign( {}, state, { [ action.siteId ]: inviteResendRequests } );
		}
		case INVITE_RESEND_REQUEST_SUCCESS: {
			const inviteResendSuccesses = Object.assign( {}, state[ action.siteId ], {
				[ action.inviteId ]: 'success',
			} );
			return Object.assign( {}, state, { [ action.siteId ]: inviteResendSuccesses } );
		}
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
 * @returns {Object}        Updated state
 */
export function deleting( state = {}, action ) {
	switch ( action.type ) {
		case INVITES_DELETE_REQUEST: {
			const inviteDeletionRequests = Object.assign(
				{},
				state[ action.siteId ],
				Object.fromEntries( action.inviteIds.map( ( id ) => [ id, 'requesting' ] ) )
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionRequests } );
		}
		case INVITES_DELETE_REQUEST_FAILURE: {
			const inviteDeletionFailures = Object.assign(
				{},
				state[ action.siteId ],
				Object.fromEntries( action.inviteIds.map( ( id ) => [ id, 'failure' ] ) )
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionFailures } );
		}
		case INVITES_DELETE_REQUEST_SUCCESS: {
			const inviteDeletionSuccesses = Object.assign(
				{},
				state[ action.siteId ],
				Object.fromEntries( action.inviteIds.map( ( id ) => [ id, 'success' ] ) )
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionSuccesses } );
		}
	}

	return state;
}

export function validation( state = {}, action ) {
	switch ( action.type ) {
		case INVITES_VALIDATE_TOKEN:
			return Object.assign( {}, state, {
				progress: true,
				failure: false,
			} );

		case INVITES_VALIDATE_TOKEN_SUCCESS:
			return Object.assign( {}, state, {
				progress: false,
				failure: false,
				errors: Array.isArray( action.data.errors ) ? {} : action.data.errors,
				success: action.data.success,
			} );

		case INVITES_VALIDATE_TOKEN_FAILURE:
			return Object.assign( {}, state, {
				progress: false,
				failure: true,
			} );
	}

	return state;
}

const initInvitingState = {
	progress: false,
	error: false,
	errorType: undefined,
	failure: false,
	success: false,
};
export function inviting( state = initInvitingState, action ) {
	switch ( action.type ) {
		case INVITES_SEND:
			return Object.assign( {}, state, {
				progress: true,
				success: false,
			} );

		case INVITES_SEND_ERROR:
			return Object.assign( {}, state, {
				...initInvitingState,
				error: true,
				errorType: action.errorType,
			} );

		case INVITES_SEND_SUCCESS:
			return Object.assign( {}, state, {
				...initInvitingState,
				success: true,
			} );

		case INVITES_SEND_FAILURE:
			return Object.assign( {}, state, {
				...initInvitingState,
				failure: true,
			} );
	}

	return state;
}

const combinedReducer = combineReducers( {
	requesting,
	items,
	counts,
	requestingResend,
	deleting,
	links,
	validation,
	inviting,
} );

export default withStorageKey( 'invites', combinedReducer );
