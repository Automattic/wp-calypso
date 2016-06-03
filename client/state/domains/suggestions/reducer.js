/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	DOMAINS_SUGGESTIONS_RECEIVE,
	DOMAINS_SUGGESTIONS_REQUEST,
	DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
	DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { itemsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';
import { getSerializedDomainsSuggestionsQuery } from './utils';

/**
 * Tracks domains suggestions, indexed by a serialized query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case DOMAINS_SUGGESTIONS_RECEIVE:
			const serializedQuery = getSerializedDomainsSuggestionsQuery( action.queryObject );
			if ( serializedQuery ) {
				return Object.assign( {}, state, {
					[ serializedQuery ]: action.suggestions
				} );
			}
			return state;
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, itemsSchema ) ) {
				return state;
			}
			return {};
	}
	return state;
}

/**
 * Tracks domains suggestions request state, indexed by a serialized query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case DOMAINS_SUGGESTIONS_REQUEST:
		case DOMAINS_SUGGESTIONS_REQUEST_FAILURE:
		case DOMAINS_SUGGESTIONS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedDomainsSuggestionsQuery( action.queryObject );
			if ( serializedQuery ) {
				return Object.assign( {}, state, {
					[ serializedQuery ]: action.type === DOMAINS_SUGGESTIONS_REQUEST
				} );
			}
			return state;
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

/**
 * Tracks domains suggestions error state, indexed by a serialized query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function errors( state = {}, action ) {
	const serializedQuery = action.queryObject && getSerializedDomainsSuggestionsQuery( action.queryObject );
	switch ( action.type ) {
		case DOMAINS_SUGGESTIONS_REQUEST:
		case DOMAINS_SUGGESTIONS_REQUEST_SUCCESS:
			if ( serializedQuery ) {
				return Object.assign( {}, state, {
					[ serializedQuery ]: null
				} );
			}
			return state;
		case DOMAINS_SUGGESTIONS_REQUEST_FAILURE:
			if ( serializedQuery ) {
				return Object.assign( {}, state, {
					[ serializedQuery ]: action.error
				} );
			}
			return state;
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	items,
	requesting,
	errors
} );
