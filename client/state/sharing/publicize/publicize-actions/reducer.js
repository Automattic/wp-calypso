/**
 * External dependencies
 */
import { omit, get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST,
	PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS,
	PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_FAILURE,
	PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST,
	PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS,
	PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_FAILURE,
	PUBLICIZE_SHARE_ACTION_DELETE,
	PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS,
	PUBLICIZE_SHARE_ACTION_DELETE_FAILURE,
	PUBLICIZE_SHARE_ACTION_EDIT,
	PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS,
	PUBLICIZE_SHARE_ACTION_EDIT_FAILURE,
	PUBLICIZE_SHARE_DISMISS,
	PUBLICIZE_SHARE_ACTION_SCHEDULE,
	PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS,
	PUBLICIZE_SHARE_ACTION_SCHEDULE_FAILURE,
} from 'state/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'state/utils';
import { publicizeActionsSchema } from './schema';

/**
 * Updates deeply nested data for the siteId/postId subtree
 *
 * @param {mixed} newValue - new value to assign in the subtree
 * @param {object} state previous state
 * @param {number} siteId siteId
 * @param {number} postId siteId
 * @param {number} actionId This parameter is optional. If passed, it will update value nested deeper in the actionId subtree
 * @returns {object} New mutated state
 */
export function updateDataForPost( newValue, state, siteId, postId, actionId ) {
	if ( typeof actionId !== 'undefined' ) {
		newValue = {
			...get( state, [ siteId, postId ], {} ),
			[ actionId ]: newValue,
		};
	}
	return {
		...state,
		[ siteId ]: {
			...get( state, [ siteId ], {} ),
			[ postId ]: newValue,
		},
	};
}

export const scheduled = withSchemaValidation( publicizeActionsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS: {
			const { siteId, postId, actions } = action;
			return updateDataForPost( actions, state, siteId, postId );
		}
		case PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS: {
			const { siteId, postId, actionId } = action;

			return updateDataForPost(
				omit( get( state, [ siteId, postId ], {} ), [ actionId ] ),
				state,
				siteId,
				postId
			);
		}
		case PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS: {
			const { siteId, postId, item } = action;
			return updateDataForPost( item, state, siteId, postId, item.ID );
		}
		case PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS: {
			const { siteId, postId, items } = action;
			items.forEach(
				( item ) => ( state = updateDataForPost( item, state, siteId, postId, item.ID ) )
			);
			return state;
		}
	}

	return state;
} );

export const published = withSchemaValidation( publicizeActionsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS: {
			const { siteId, postId, actions } = action;
			return updateDataForPost( actions, state, siteId, postId );
		}
	}

	return state;
} );

export const fetchingSharePostActionsScheduled = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS: {
			const { siteId, postId } = action;
			return updateDataForPost( false, state, siteId, postId );
		}
		case PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_FAILURE: {
			const { siteId, postId } = action;
			return updateDataForPost( false, state, siteId, postId );
		}
		case PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST: {
			const { siteId, postId } = action;
			return updateDataForPost( true, state, siteId, postId );
		}
	}

	return state;
} );

export const fetchingSharePostActionsPublished = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS: {
			const { siteId, postId } = action;
			return updateDataForPost( false, state, siteId, postId );
		}
		case PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_FAILURE: {
			const { siteId, postId } = action;
			return updateDataForPost( false, state, siteId, postId );
		}
		case PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST: {
			const { siteId, postId } = action;
			return updateDataForPost( true, state, siteId, postId );
		}
	}

	return state;
} );

export const deletingSharePostAction = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS: {
			const { siteId, postId, actionId } = action;
			return updateDataForPost( false, state, siteId, postId, actionId );
		}
		case PUBLICIZE_SHARE_ACTION_DELETE_FAILURE: {
			const { siteId, postId, actionId } = action;
			return updateDataForPost( false, state, siteId, postId, actionId );
		}
		case PUBLICIZE_SHARE_ACTION_DELETE: {
			const { siteId, postId, actionId } = action;
			return updateDataForPost( true, state, siteId, postId, actionId );
		}
	}

	return state;
} );

export const editingSharePostAction = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS: {
			const { siteId, postId, item } = action;
			return updateDataForPost( false, state, siteId, postId, item.ID );
		}
		case PUBLICIZE_SHARE_ACTION_EDIT_FAILURE: {
			const { siteId, postId, actionId } = action;
			return updateDataForPost( false, state, siteId, postId, actionId );
		}
		case PUBLICIZE_SHARE_ACTION_EDIT: {
			const { siteId, postId, actionId } = action;
			return updateDataForPost( true, state, siteId, postId, actionId );
		}
	}

	return state;
} );

export const schedulingSharePostActionStatus = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS: {
			const { siteId, postId, share_date } = action;
			return updateDataForPost(
				{ status: 'success', shareDate: share_date },
				state,
				siteId,
				postId
			);
		}
		case PUBLICIZE_SHARE_ACTION_SCHEDULE_FAILURE: {
			const { siteId, postId } = action;
			return updateDataForPost( { status: 'failure' }, state, siteId, postId );
		}
		case PUBLICIZE_SHARE_ACTION_SCHEDULE: {
			const { siteId, postId } = action;
			return updateDataForPost( { status: 'requesting' }, state, siteId, postId );
		}
		case PUBLICIZE_SHARE_DISMISS: {
			const { siteId, postId } = action;
			return updateDataForPost( undefined, state, siteId, postId );
		}
	}

	return state;
} );

export default combineReducers( {
	scheduled,
	published,
	fetchingSharePostActionsScheduled,
	fetchingSharePostActionsPublished,
	deletingSharePostAction,
	editingSharePostAction,
	schedulingSharePostActionStatus,
} );
