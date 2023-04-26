import { omit, get } from 'lodash';
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
	PUBLICIZE_SHARE_DISMISS,
	PUBLICIZE_SHARE_ACTION_SCHEDULE,
	PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS,
	PUBLICIZE_SHARE_ACTION_SCHEDULE_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { publicizeActionsSchema } from './schema';

/**
 * Updates deeply nested data for the siteId/postId subtree
 *
 * @param {Object} newValue - new value to assign in the subtree
 * @param {Object} state previous state
 * @param {number} siteId siteId
 * @param {number} postId siteId
 * @param {number} actionId This parameter is optional. If passed, it will update value nested deeper in the actionId subtree
 * @returns {Object} New mutated state
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

export const fetchingSharePostActionsScheduled = ( state = {}, action ) => {
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
};

export const fetchingSharePostActionsPublished = ( state = {}, action ) => {
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
};

export const deletingSharePostAction = ( state = {}, action ) => {
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
};

export const schedulingSharePostActionStatus = ( state = {}, action ) => {
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
};

export default combineReducers( {
	scheduled,
	published,
	fetchingSharePostActionsScheduled,
	fetchingSharePostActionsPublished,
	deletingSharePostAction,
	schedulingSharePostActionStatus,
} );
