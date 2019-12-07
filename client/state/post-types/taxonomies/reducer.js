/**
 * External dependencies
 */

import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_TYPES_TAXONOMIES_RECEIVE,
	POST_TYPES_TAXONOMIES_REQUEST,
	POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
	POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
} from 'state/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';
import { itemsSchema } from './schema';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state is a mapping of site ID to post type to whether a request for that
 * post type is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_TYPES_TAXONOMIES_REQUEST:
		case POST_TYPES_TAXONOMIES_REQUEST_SUCCESS:
		case POST_TYPES_TAXONOMIES_REQUEST_FAILURE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postType ]: POST_TYPES_TAXONOMIES_REQUEST === action.type,
				},
			} );
	}

	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state is a mapping of site ID to post type to taxonomies.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case POST_TYPES_TAXONOMIES_RECEIVE:
			return {
				...state,
				[ action.siteId ]: {
					...state[ action.siteId ],
					[ action.postType ]: action.taxonomies,
				},
			};

		default:
			return state;
	}
} );

export default combineReducers( {
	requesting,
	items,
} );
