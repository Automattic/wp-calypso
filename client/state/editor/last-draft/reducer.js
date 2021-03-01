/**
 * Internal dependencies
 */
import { EDITOR_LAST_DRAFT_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

/**
 * Returns the updated editor last draft site ID state after an action has been
 * dispatched.
 *
 * @param  {?number} state  Current state
 * @param  {object}  action Action payload
 * @returns {?number}        Updated state
 */
export function siteId( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_LAST_DRAFT_SET:
			return action.siteId;
	}

	return state;
}

/**
 * Returns the updated editor last draft post ID state after an action has been
 * dispatched.
 *
 * @param  {?number} state  Current state
 * @param  {object}  action Action payload
 * @returns {?number}        Updated state
 */
export function postId( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_LAST_DRAFT_SET:
			return action.postId;
	}

	return state;
}

export default combineReducers( {
	siteId,
	postId,
} );
