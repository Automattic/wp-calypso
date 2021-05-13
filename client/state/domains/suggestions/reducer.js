/* eslint-disable no-case-declarations */
/**
 * Internal dependencies
 */
import {
	DOMAINS_SUGGESTIONS_RECEIVE,
	DOMAINS_SUGGESTIONS_REQUEST,
	DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
	DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema } from './schema';
import { getSerializedDomainsSuggestionsQuery } from './utils';

/**
 * Tracks domains suggestions, indexed by a serialized query.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAINS_SUGGESTIONS_RECEIVE:
			const serializedQuery = getSerializedDomainsSuggestionsQuery( action.queryObject );
			if ( serializedQuery ) {
				return Object.assign( {}, state, {
					[ serializedQuery ]: action.suggestions,
				} );
			}
			return state;
	}
	return state;
} );

/**
 * Tracks domains suggestions request state, indexed by a serialized query.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case DOMAINS_SUGGESTIONS_REQUEST:
		case DOMAINS_SUGGESTIONS_REQUEST_FAILURE:
		case DOMAINS_SUGGESTIONS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedDomainsSuggestionsQuery( action.queryObject );
			if ( serializedQuery ) {
				return Object.assign( {}, state, {
					[ serializedQuery ]: action.type === DOMAINS_SUGGESTIONS_REQUEST,
				} );
			}
			return state;
	}
	return state;
}

/**
 * Tracks domains suggestions error state, indexed by a serialized query.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function errors( state = {}, action ) {
	const serializedQuery =
		action.queryObject && getSerializedDomainsSuggestionsQuery( action.queryObject );
	switch ( action.type ) {
		case DOMAINS_SUGGESTIONS_REQUEST:
		case DOMAINS_SUGGESTIONS_REQUEST_SUCCESS:
			if ( serializedQuery ) {
				return Object.assign( {}, state, {
					[ serializedQuery ]: null,
				} );
			}
			return state;
		case DOMAINS_SUGGESTIONS_REQUEST_FAILURE:
			if ( serializedQuery ) {
				return Object.assign( {}, state, {
					[ serializedQuery ]: action.error,
				} );
			}
			return state;
	}
	return state;
}

export default combineReducers( {
	items,
	requesting,
	errors,
} );
