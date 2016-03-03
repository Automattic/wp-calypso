/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { EDITOR_POST_ID_SET } from 'state/action-types';
import media from './media/reducer';
import contactForm from './contact-form/reducer';

/**
 * Returns the updated editor post ID state after an action has been
 * dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function postId( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_POST_ID_SET:
			return action.postId;
	}

	return state;
}

export default combineReducers( {
	postId,
	media,
	contactForm
} );
