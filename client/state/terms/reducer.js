/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import {
	TERMS_RECEIVE,
	DESERIALIZE
} from 'state/action-types';
import { isValidStateWithSchema } from 'state/utils';
import {
	termsSchema,
	taxonomiesSchema
} from './schema';

export function taxonomies( state = {}, action ) {
	switch ( action.type ) {
		case TERMS_RECEIVE:
			const currentTaxonomyTermIds = get( state, [ action.siteId, action.taxonomy ], [] );
			// This feels a bit odd to me, but uncertain of best way to handle paginated data?
			// Perhaps a new action.type TERMS_PAGE_RECIEVE?
			const newTaxonomyTermIds = uniq( currentTaxonomyTermIds.concat( action.terms.map( ( term ) => term.ID ) ) );
			const newState = {
				[ action.siteId ]: {
					[ action.taxonomy ]: newTaxonomyTermIds
				}
			};
			return merge( {}, state, newState );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, taxonomiesSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

/**
 * Returns the updated terms state after an action has been dispatched.
 * The state reflects a mapping of site ID, and taxonomy to terms
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function terms( state = {}, action ) {
	switch ( action.type ) {
		case TERMS_RECEIVE:
			return merge( {}, state, {
				[ action.siteId ]: keyBy( action.terms, 'ID' )
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
	taxonomies,
	terms
} );
