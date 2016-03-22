/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import {
	POST_COUNTS_RECEIVE,
	POST_COUNTS_REQUEST,
	POST_COUNTS_REQUEST_SUCCESS,
	POST_COUNTS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { isValidStateWithSchema } from 'state/utils';
import { countsSchema } from './schema';

/**
 * Returns the updated post types requesting state after an action has been
 * dispatched. The state reflects a mapping of site ID, post type pairing to a
 * boolean reflecting whether a request for the post types is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_COUNTS_REQUEST:
		case POST_COUNTS_REQUEST_SUCCESS:
		case POST_COUNTS_REQUEST_FAILURE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postType ]: POST_COUNTS_REQUEST === action.type
				}
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated post count state after an action has been dispatched.
 * The state reflects a mapping of site ID, post type, [all/mine], post status
 * to the number of posts.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function counts( state = {}, action ) {
	switch ( action.type ) {
		case POST_COUNTS_RECEIVE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postType ]: action.counts
				}
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, countsSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	requesting,
	counts
} );
