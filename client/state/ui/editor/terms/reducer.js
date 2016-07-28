/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge, get, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import { TERMS_RECEIVE, EDITOR_TERM_ADDED_SET } from 'state/action-types';

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
		case TERMS_RECEIVE:
			if ( isUndefined( action.postId ) ) {
				return state;
			}
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: {
						[ action.taxonomy ]: get( action.terms, '[0].ID' )
					}
				}
			} );

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
