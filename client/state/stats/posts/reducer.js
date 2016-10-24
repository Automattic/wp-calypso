/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import { isValidStateWithSchema } from 'state/utils';
import { items as itemSchemas } from './schema';
import {
	SERIALIZE,
	DESERIALIZE,
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_FAILURE,
	POST_STATS_REQUEST_SUCCESS
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_STATS_REQUEST:
		case POST_STATS_REQUEST_SUCCESS:
		case POST_STATS_REQUEST_FAILURE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: {
						[ action.stat ]: POST_STATS_REQUEST === action.type
					}
				}
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to the value of the stat.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case POST_STATS_RECEIVE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: {
						[ action.stat ]: action.value
					}
				}
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, itemSchemas ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	requesting,
	items
} );
