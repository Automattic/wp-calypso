/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_SITE_BLOCK_REQUEST,
	READER_SITE_BLOCK_REQUEST_SUCCESS,
	READER_SITE_BLOCK_REQUEST_FAILURE,
	READER_SITE_UNBLOCK_REQUEST,
	READER_SITE_UNBLOCK_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

/**
 * Tracks all known block statuses, indexed by site ID.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_SITE_BLOCK_REQUEST_SUCCESS:
			return {
				...state,
				[ action.siteId ]: action.data.success
			};

		case READER_SITE_UNBLOCK_REQUEST_SUCCESS:
			return {
				...state,
				[ action.siteId ]: ! action.data.success
			};

		// Always return default state - we don't want to serialize yet
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
		case READER_SITE_BLOCK_REQUEST:
		case READER_SITE_BLOCK_REQUEST_SUCCESS:
		case READER_SITE_BLOCK_REQUEST_FAILURE:
			return {
				...state,
				[ action.siteId ]: action.type === READER_SITE_BLOCK_REQUEST
			};

		case READER_SITE_UNBLOCK_REQUEST:
		case READER_SITE_UNBLOCK_REQUEST_SUCCESS:
		case READER_SITE_UNBLOCK_REQUEST_FAILURE:
			return {
				...state,
				[ action.siteId ]: action.type === READER_SITE_UNBLOCK_REQUEST
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
