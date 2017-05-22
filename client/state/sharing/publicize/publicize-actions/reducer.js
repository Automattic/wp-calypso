/**
 * External dependencies
 */
import { combineReducers } from 'redux';
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
} from 'state/action-types';
import { publicizeActionsSchema } from './schema';
import { createReducer } from 'state/utils';

function updateDataForPost( newValue, state, siteId, postId, actionId ) {
	if ( typeof actionId !== 'undefined' ) {
		newValue = {
			...get( state, [ siteId, postId ], {} ),
			[ actionId ]: newValue,
		};
	}
	return (
		{
			...state,
			[ siteId ]: {
				...get( state, [ siteId ], {} ),
				[ postId ]: newValue,
			}
		}
	);
}

export const scheduled = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS ]:
		( state, { siteId, postId, actions } ) => updateDataForPost( actions, state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS ]:
		( state, { siteId, postId, actionId } ) => updateDataForPost(
			omit( get( state, [ siteId, postId ], {} ), [ actionId ] ),
			state,
			siteId,
			postId,
		),
	[ PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS ]:
		( state, { siteId, postId, item } ) => updateDataForPost( item, state, siteId, postId, item.ID ),

}, publicizeActionsSchema );

export const published = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS ]:
		( state, { siteId, postId, actions } ) => updateDataForPost( actions, state, siteId, postId ),
}, publicizeActionsSchema );

export const fetchingSharePostActionsScheduled = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_SUCCESS ]:
		( state, { siteId, postId } ) => updateDataForPost( false, state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST_FAILURE ]:
		( state, { siteId, postId } ) => updateDataForPost( false, state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTIONS_SCHEDULED_REQUEST ]:
		( state, { siteId, postId } ) => updateDataForPost( true, state, siteId, postId ),
} );

export const fetchingSharePostActionsPublished = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_SUCCESS ]:
		( state, { siteId, postId } ) => updateDataForPost( false, state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST_FAILURE ]:
		( state, { siteId, postId } ) => updateDataForPost( false, state, siteId, postId ),
	[ PUBLICIZE_SHARE_ACTIONS_PUBLISHED_REQUEST ]:
		( state, { siteId, postId } ) => updateDataForPost( true, state, siteId, postId ),
} );

export const deletingSharePostAction = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTION_DELETE_SUCCESS ]:
		( state, { siteId, postId, actionId } ) => updateDataForPost( false, state, siteId, postId, actionId ),
	[ PUBLICIZE_SHARE_ACTION_DELETE_FAILURE ]:
		( state, { siteId, postId, actionId } ) => updateDataForPost( false, state, siteId, postId, actionId ),
	[ PUBLICIZE_SHARE_ACTION_DELETE ]:
		( state, { siteId, postId, actionId } ) => updateDataForPost( true, state, siteId, postId, actionId ),
} );

export const editingSharePostAction = createReducer( {}, {
	[ PUBLICIZE_SHARE_ACTION_EDIT_SUCCESS ]:
		( state, { siteId, postId, item } ) => updateDataForPost( false, state, siteId, postId, item.ID ),
	[ PUBLICIZE_SHARE_ACTION_EDIT_FAILURE ]:
		( state, { siteId, postId, actionId } ) => updateDataForPost( false, state, siteId, postId, actionId ),
	[ PUBLICIZE_SHARE_ACTION_EDIT ]:
		( state, { siteId, postId, actionId } ) => updateDataForPost( true, state, siteId, postId, actionId ),
} );

export default combineReducers( {
	scheduled,
	published,
	fetchingSharePostActionsScheduled,
	fetchingSharePostActionsPublished,
	deletingSharePostAction,
	editingSharePostAction,
} );
