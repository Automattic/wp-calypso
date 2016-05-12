/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
	SERIALIZE
} from 'state/action-types';
import { isValidStateWithSchema } from 'state/utils';
import {
	termsSchema
} from './schema';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state is a mapping of site ID to taxonomy to whether a request for that
 * taxonomy is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case TERMS_REQUEST:
		case TERMS_REQUEST_SUCCESS:
		case TERMS_REQUEST_FAILURE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.taxonomy ]: TERMS_REQUEST === action.type
				}
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated terms state after an action has been dispatched.
 * The state reflects a mapping of site ID to terms
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case TERMS_RECEIVE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.taxonomy ]: keyBy( action.terms, 'ID' )
				}
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, termsSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	items,
	requesting
} );
