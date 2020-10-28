/**
 * External dependencies
 */

import { merge, omit, uniqueId } from 'lodash';
import { combineReducers } from 'calypso/state/utils';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT,
	WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
} from 'woocommerce/state/action-types';

/**
 * Returns the updated state after an action has been dispatched.
 * The state reflects the currently edited review reply ID (which might
 * be a placeholder object).
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function currentlyEditingId( state = null, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT:
			if ( action.reply && action.reply.id ) {
				return action.reply.id;
			}
			return { placeholder: uniqueId( 'review_reply_' ) };
		case WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT:
			return null;
		default:
			return state;
	}
}

/**
 * Returns the updated state after an action has been dispatched.
 * The state reflects the review Id for the reply currently being edited.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function reviewId( state = null, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT:
			return action.reviewId;
		case WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT:
			return null;
		default:
			return state;
	}
}

/**
 * Returns the updated state after an action has been dispatched.
 * The state reflects changes made to the current review reply (including
 * new replies)
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function changes( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT:
			const reply = omit( action.reply, 'id' );
			return merge( {}, state, reply );
		case WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT:
			return {};
		default:
			return state;
	}
}

export default combineReducers( {
	changes,
	currentlyEditingId,
	reviewId,
} );
