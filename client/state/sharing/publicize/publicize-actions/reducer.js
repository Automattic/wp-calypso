/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_SHARE_ACTIONS_REQUEST,
	PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS,
	PUBLICIZE_SHARE_ACTIONS_REQUEST_FAILURE,
	PUBLICIZE_SHARE_ACTION_DELETE,
	PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS,
	PUBLICIZE_SHARE_ACTION_DELETE_FAILURE,
	PUBLICIZE_SHARE_ACTION_EDIT,
	PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS,
	PUBLICIZE_SHARE_ACTION_EDIT_FAILURE,
} from 'state/action-types';
import { publicizeActionsSchema } from './schema';
import { createReducer } from 'state/utils';

function updateDataForPost( newValue, state, siteId, postId, actionId = undefined ) {
	if ( actionId !== undefined ) {
		newValue = {
			...state[ siteId ][ postId ],
			newValue
		};
	}
	return (
		{
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ postId ]: newValue
			}
		}
	);
}

export const items = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS ]: ( state, { siteId, postId, actions } ) => updateDataForPost( actions, state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS ]: ( state, { siteId, postId, actionId } ) => updateDataForPost( omit( state[ siteId ][ postId ], [ actionId ] ), state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS ]: ( state, { siteId, postId, action } ) => updateDataForPost( action, state, siteId, postId, action.ID ),

}, publicizeActionsSchema );

export const fetchingSharePostActions = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS ]: ( state, { siteId, postId } ) => updateDataForPost( false, state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTIONS_REQUEST_FAILURE ]: ( state, { siteId, postId } ) => updateDataForPost( false, state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTIONS_REQUEST ]: ( state, { siteId, postId } ) => updateDataForPost( true, state, siteId, postId ),
} );

export const deletingSharePostAction = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS ]: ( state, { siteId, postId, actionId } ) => updateDataForPost( false, state, siteId, postId, actionId ),
	[ PUBLICIZE_SHARE_ACTION_DELETE_FAILURE ]: ( state, { siteId, postId, actionId } ) => updateDataForPost( false, state, siteId, postId, actionId ),
	[ PUBLICIZE_SHARE_ACTION_DELETE ]: ( state, { siteId, postId, actionId } ) => updateDataForPost( true, state, siteId, postId, actionId ),
} );

export const editingSharePostAction = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS ]: ( state, { siteId, postId, actionId } ) => updateDataForPost( false, state, siteId, postId, actionId ),
	[ PUBLICIZE_SHARE_ACTION_EDIT_FAILURE ]: ( state, { siteId, postId, actionId } ) => updateDataForPost( false, state, siteId, postId, actionId ),
	[ PUBLICIZE_SHARE_ACTION_EDIT ]: ( state, { siteId, postId, actionId } ) => updateDataForPost( true, state, siteId, postId, actionId ),
} );


export default combineReducers( {
	items,
	fetchingSharePostActions,
	deletingSharePostAction,
	editingSharePostAction
} );
