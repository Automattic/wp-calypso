/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { isValidStateWithSchema } from 'state/utils';
import * as schema from './schema';
import {
	SERIALIZE,
	DESERIALIZE,
	POST_FORMATS_RECEIVE,
	POST_FORMATS_REQUEST,
	POST_FORMATS_REQUEST_SUCCESS,
	POST_FORMATS_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID keys to whether a request for post formats is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_FORMATS_REQUEST:
		case POST_FORMATS_REQUEST_SUCCESS:
		case POST_FORMATS_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: POST_FORMATS_REQUEST === action.type
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site supported post formats.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case POST_FORMATS_RECEIVE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.formats
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
	items
} );
