/** @format */
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
import { combineReducers, createReducer } from 'state/utils';
import { publicizeActionsSchema } from './schema';

/**
 * Updates deeply nested data for the siteId/postId subtree
 * @param {mixed} newValue - new value to assign in the subtree
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

export const scheduled = createReducer(
	{},
	{
		[ PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS ]: ( state, { siteId, postId, actions } ) =>
			updateDataForPost( actions, state, siteId, postId ),
		[ PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS ]: ( state, { siteId, postId, actionId } ) =>
			updateDataForPost(
				omit( get( state, [ siteId, postId ], {} ), [ actionId ] ),
				state,
				siteId,
				postId
			),
		[ PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS ]: ( state, { siteId, postId, item } ) =>
			updateDataForPost( item, state, siteId, postId, item.ID ),
		[ PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS ]: ( state, { siteId, postId, items } ) => {
			items.forEach(
				item => ( state = updateDataForPost( item, state, siteId, postId, item.ID ) )
			);
			return state;
		},
	},
	publicizeActionsSchema
);

export const published = createReducer(
	{},
	{
		[ PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS ]: ( state, { siteId, postId, actions } ) =>
			updateDataForPost( actions, state, siteId, postId ),
	},
	publicizeActionsSchema
);

export const fetchingSharePostActionsScheduled = createReducer(
	{},
	{
		[ PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS ]: ( state, { siteId, postId } ) =>
			updateDataForPost( false, state, siteId, postId ),
		[ PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_FAILURE ]: ( state, { siteId, postId } ) =>
			updateDataForPost( false, state, siteId, postId ),
		[ PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST ]: ( state, { siteId, postId } ) =>
			updateDataForPost( true, state, siteId, postId ),
	}
);

export const fetchingSharePostActionsPublished = createReducer(
	{},
	{
		[ PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS ]: ( state, { siteId, postId } ) =>
			updateDataForPost( false, state, siteId, postId ),
		[ PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_FAILURE ]: ( state, { siteId, postId } ) =>
			updateDataForPost( false, state, siteId, postId ),
		[ PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST ]: ( state, { siteId, postId } ) =>
			updateDataForPost( true, state, siteId, postId ),
	}
);

export const deletingSharePostAction = createReducer(
	{},
	{
		[ PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS ]: ( state, { siteId, postId, actionId } ) =>
			updateDataForPost( false, state, siteId, postId, actionId ),
		[ PUBLICIZE_SHARE_ACTION_DELETE_FAILURE ]: ( state, { siteId, postId, actionId } ) =>
			updateDataForPost( false, state, siteId, postId, actionId ),
		[ PUBLICIZE_SHARE_ACTION_DELETE ]: ( state, { siteId, postId, actionId } ) =>
			updateDataForPost( true, state, siteId, postId, actionId ),
	}
);

export const editingSharePostAction = createReducer(
	{},
	{
		[ PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS ]: ( state, { siteId, postId, item } ) =>
			updateDataForPost( false, state, siteId, postId, item.ID ),
		[ PUBLICIZE_SHARE_ACTION_EDIT_FAILURE ]: ( state, { siteId, postId, actionId } ) =>
			updateDataForPost( false, state, siteId, postId, actionId ),
		[ PUBLICIZE_SHARE_ACTION_EDIT ]: ( state, { siteId, postId, actionId } ) =>
			updateDataForPost( true, state, siteId, postId, actionId ),
	}
);

export const schedulingSharePostActionStatus = createReducer(
	{},
	{
		[ PUBLICIZE_SHARE_ACTION_SCHEDULE_SUCCESS ]: ( state, { siteId, postId, share_date } ) =>
			updateDataForPost( { status: 'success', shareDate: share_date }, state, siteId, postId ),
		[ PUBLICIZE_SHARE_ACTION_SCHEDULE_FAILURE ]: ( state, { siteId, postId } ) =>
			updateDataForPost( { status: 'failure' }, state, siteId, postId ),
		[ PUBLICIZE_SHARE_ACTION_SCHEDULE ]: ( state, { siteId, postId } ) =>
			updateDataForPost( { status: 'requesting' }, state, siteId, postId ),
		[ PUBLICIZE_SHARE_DISMISS ]: ( state, { siteId, postId } ) =>
			updateDataForPost( undefined, state, siteId, postId ),
	}
);

export default combineReducers( {
	scheduled,
	published,
	fetchingSharePostActionsScheduled,
	fetchingSharePostActionsPublished,
	deletingSharePostAction,
	editingSharePostAction,
	schedulingSharePostActionStatus,
} );
