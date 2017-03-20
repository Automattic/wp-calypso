/**
 * External dependencies
 */
import { combineReducers } from 'redux';
// import { keyBy, omit, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_SHARE_ACTIONS_REQUEST,
	PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS,
	PUBLICIZE_SHARE_ACTIONS_REQUEST_FAILURE,
	// PUBLICIZE_SHARE_ACTION_DELETE,
	// PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS,
	// PUBLICIZE_SHARE_ACTION_DELETE_FAILURE,
	// PUBLICIZE_SHARE_ACTION_EDIT,
	// PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS,
	// PUBLICIZE_SHARE_ACTION_EDIT_FAILURE,
} from 'state/action-types';
import { publicizeActionsSchema } from './schema';
import { createReducer } from 'state/utils';

export const sharePostActions = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS ]: ( state, { siteId, postId, actions } ) => ( { ...state, [ siteId ]: { ...state[ siteId ], [ postId ]: actions } } ),
}, publicizeActionsSchema );

export const fetchingSharePostActions = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTIONS_REQUEST_SUCCESS ]: ( state, { siteId, postId } ) => ( { ...state, [ siteId ]: { ...state[ siteId ], [ postId ]: false } } ),
	[ PUBLICIZE_SHARE_ACTIONS_REQUEST_FAILURE ]: ( state, { siteId, postId } ) => ( { ...state, [ siteId ]: { ...state[ siteId ], [ postId ]: false } } ),
	[ PUBLICIZE_SHARE_ACTIONS_REQUEST ]: ( state, { siteId, postId } ) => ( { ...state, [ siteId ]: { ...state[ siteId ], [ postId ]: true } } ),
} );


export default combineReducers( {
	sharePostActions,
	fetchingSharePostActions,
} );
