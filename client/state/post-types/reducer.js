/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import { isValidStateWithSchema } from 'state/utils';
import * as schema from './schema';
import taxonomies from './taxonomies/reducer';
import {
	SERIALIZE,
	DESERIALIZE,
	POST_TYPES_RECEIVE,
	POST_TYPES_REQUEST,
	POST_TYPES_REQUEST_SUCCESS,
	POST_TYPES_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID keys to whether a request for post types is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_TYPES_REQUEST:
		case POST_TYPES_REQUEST_SUCCESS:
		case POST_TYPES_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: POST_TYPES_REQUEST === action.type
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object of post type name to post type for all
 * supported post types on the site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case POST_TYPES_RECEIVE:
			return Object.assign( {}, state, {
				[ action.siteId ]: keyBy( action.types, 'name' )
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, schema.items ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	requesting,
	items,
	taxonomies
} );
