/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_THUMBNAIL_REQUEST,
	READER_THUMBNAIL_REQUEST_SUCCESS,
	READER_THUMBNAIL_REQUEST_FAILURE,
	READER_THUMBNAIL_RECEIVE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

/**
 * Tracks mappings between embedUrls (iframe.src) --> thumbnails
 * Here is what the state tree may look like:
 * thumbnails: {
		items: {
			'https://www.youtube.com/watch?v=syWk7P3SPMQ': https://img.youtube.com/vi/syWk7P3SPMQ/mqdefault.jpg,
			...
		},
		requesting: {
			'https://www.youtube.com/watch?v=syWk7P3SPMQ': false,
			...
		}
	}

/**
 * Tracks all known thumbnail urls, indexed by iframe.src.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_THUMBNAIL_RECEIVE:
			return {
				...state,
				[ action.embedUrl ]: action.thumbnailUrl,
			};

		// Always return default state - we don't want to serialize thumbnails
		case SERIALIZE:
		case DESERIALIZE:
			return {};
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
		case READER_THUMBNAIL_REQUEST:
		case READER_THUMBNAIL_REQUEST_SUCCESS:
		case READER_THUMBNAIL_REQUEST_FAILURE:
			return {
				...state,
				[ action.embedUrl ]: action.type === READER_THUMBNAIL_REQUEST
			};
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	items,
	requesting
} );
