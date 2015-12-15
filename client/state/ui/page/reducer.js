/**
 * Internal dependencies
 */
import { SET_PAGE_STATE, RESET_PAGE_STATE } from 'state/action-types';

/**
 * Tracks the current page state.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export default function( state = {}, action ) {
	switch ( action.type ) {
		case SET_PAGE_STATE:
			state = Object.assign( {}, state, {
				[ action.key ]: action.value
			} );
			break;
		case RESET_PAGE_STATE:
			state = {};
			break;
	}

	return state;
}
