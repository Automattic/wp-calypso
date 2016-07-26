/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import { EDITOR_TERM_ADDED_SET } from 'state/action-types';

/**
 * Returns the updated editor term taxonomy added state after action has been
 * dispatched.
 *
 * @param  {?Number} state  Current state
 * @param  {Object}  action Action payload
 * @return {?Number}        Updated state
 */
export function added( state = null, action ) {
	switch ( action.type ) {
		case EDITOR_TERM_ADDED_SET:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: {
						[ action.taxonomy ]: action.termId
					}
				}
			} );
	}

	return state;
}

export default combineReducers( {
	added
} );
