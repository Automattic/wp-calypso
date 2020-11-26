/**
 * External dependencies
 */
import { includes, map, pick, zipObject } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	combineReducers,
	withSchemaValidation,
	withoutPersistence,
	withStorageKey,
} from 'calypso/state/utils';
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
} from 'calypso/state/action-types';
import { inviteItemsSchema, inviteLinksSchema } from './schema';

/**
 * Returns the updated site invites requests state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean reflecting
 * whether a request for the post is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
			action.links.forEach( ( link ) => {
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const counts = withoutPersistence( ( state = {}, action ) => {
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
} );

/**
 * Returns the updated site invites resend requests state after an action has been
 * dispatched. The state reflects an object keyed by site ID, consisting of requested
 * resend invite IDs, with a string representing request status.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function deleting( state = {}, action ) {
	switch ( action.type ) {
		case INVITES_DELETE_REQUEST: {
			const inviteDeletionRequests = Object.assign(
				{},
				state[ action.siteId ],
				zipObject(
					action.inviteIds,
					map( action.inviteIds, () => 'requesting' )
				)
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionRequests } );
		}
		case INVITES_DELETE_REQUEST_FAILURE: {
			const inviteDeletionFailures = Object.assign(
				{},
				state[ action.siteId ],
				zipObject(
					action.inviteIds,
					map( action.inviteIds, () => 'failure' )
				)
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionFailures } );
		}
		case INVITES_DELETE_REQUEST_SUCCESS: {
			const inviteDeletionSuccesses = Object.assign(
				{},
				state[ action.siteId ],
				zipObject(
					action.inviteIds,
					map( action.inviteIds, () => 'success' )
				)
			);
			return Object.assign( {}, state, { [ action.siteId ]: inviteDeletionSuccesses } );
		}
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
} );

export default withStorageKey( 'invites', combinedReducer );
