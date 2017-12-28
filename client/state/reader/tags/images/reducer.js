/** @format */
/**
 * Internal dependencies
 */
import {
	READER_TAG_IMAGES_RECEIVE,
	READER_TAG_IMAGES_REQUEST,
	READER_TAG_IMAGES_REQUEST_SUCCESS,
	READER_TAG_IMAGES_REQUEST_FAILURE,
} from 'client/state/action-types';
import { combineReducers } from 'client/state/utils';

/**
 * Tracks all known image objects, indexed by tag name.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_TAG_IMAGES_RECEIVE:
			let images = action.images;
			if ( state[ action.tag ] ) {
				images = state[ action.tag ].concat( action.images );
			}

			return {
				...state,
				[ action.tag ]: images,
			};
	}

	return state;
}

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case READER_TAG_IMAGES_REQUEST:
		case READER_TAG_IMAGES_REQUEST_SUCCESS:
		case READER_TAG_IMAGES_REQUEST_FAILURE:
			return {
				...state,
				[ action.tag ]: action.type === READER_TAG_IMAGES_REQUEST,
			};
	}
	return state;
}

export default combineReducers( {
	items,
	requesting,
} );
