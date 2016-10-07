/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import images from './images/reducer';
import items from './items';

/**
 * Returns errors received when trying to update tags, keyed by tag ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function errors( state = {}, action ) {
	action;
	/*
	switch ( action.type ) {
		case READER_LIST_UPDATE_FAILURE:
			const newError = {};
			newError[ action.list.ID ] = action.error.statusCode;
			return Object.assign( {}, state, newError );

		case READER_LIST_DISMISS_NOTICE:
			// Remove the dismissed list ID
			return omit( state, action.listId );

		case SERIALIZE:
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, errorsSchema ) ) {
				return {};
			}
	}
	*/
	return state;
}

export default combineReducers( {
	images,
	items,
} );
