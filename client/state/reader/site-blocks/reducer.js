/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	READER_SITE_BLOCK_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK_REQUEST_SUCCESS,
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

export default items;

