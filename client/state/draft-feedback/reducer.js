/**
 * External dependencies
 */
import { without } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DRAFT_FEEDBACK_SHARE_ADD,
	DRAFT_FEEDBACK_SHARE_REMOVE,
	DRAFT_FEEDBACK_SHARE_REVOKE,
	DRAFT_FEEDBACK_SHARE_RESTORE,
	DRAFT_FEEDBACK_COMMENT_ADD,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

/**
 * Reducer for the emails addresses a draft has been shared with.
 *
 * @param 	{string[]}		state 	Current email addresses
 * @param 	{Object}		action 	An action
 * @returns {string[]} 				The latest email addresses
 */
export const emails = ( state = [], { type, emailAddress } ) => {
	switch ( type ) {
		case DRAFT_FEEDBACK_SHARE_ADD:
			return state.indexOf( emailAddress ) >= 0 ? state : state.concat( emailAddress );
		case DRAFT_FEEDBACK_SHARE_REMOVE:
			return without( state, emailAddress );
		default:
			return state;
	}
};

/**
 * Reducer for whether a share is enabled
 *
 * @param	{boolean}	state	Current enabled state
 * @param	{Object}	action	An action
 * @returns	{boolean}			The latest enabled state
 */
export const isEnabled = ( state = true, action ) => {
	switch ( action.type ) {
		case DRAFT_FEEDBACK_SHARE_REVOKE:
			return false;
		case DRAFT_FEEDBACK_SHARE_RESTORE:
			return true;
		default:
			return state;
	}
};

/**
 * Reducer for a share's comments
 *
 * @param	{string[]}	state	Current share comments
 * @param	{Object}	action	An action
 * @returns	{string[]}			The latest share comments
 */
export const comments = ( state = [], action ) =>
	DRAFT_FEEDBACK_COMMENT_ADD === action.type ? state.concat( action.comment ) : state;

// Export to test exported initial state
export const share = combineReducers( {
	isEnabled,
	comments,
} );

// Export the initial share state for use by draft-feedback selectors
export const initialShareState = share( undefined, { type: '@@calypso/INIT' } );

/**
 * Reducer for draft feedback shares that handles removing shares
 *
 * @param	{Object.<string, Object>}	state	The current shares state
 * @param 	{Object}					action	An action
 * @returns	{Object.<string, Object>}			The latest shares state
 */
export const removableShare = ( state = {}, action ) =>
	DRAFT_FEEDBACK_SHARE_REMOVE === action.type ? undefined : share( state, action );

export default keyedReducer(
	'siteId',
	keyedReducer(
		'postId',
		combineReducers( {
			emails,
			shares: keyedReducer( 'emailAddress', removableShare ),
		} ),
	),
);
