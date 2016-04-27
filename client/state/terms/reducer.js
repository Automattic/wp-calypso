/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';
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
	termsSchema
} from './schema';

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
			const existingSiteTaxonomies = get( state, [ action.siteId ], {} );
			const existingTaxonomyTerms = get( state, [ action.siteId, action.taxonomy ], {} );

			const newTaxonomyTerms = merge( {}, existingTaxonomyTerms, keyBy( action.terms, 'ID' ) );

			const newSiteTaxonomies = merge( {}, existingSiteTaxonomies, {
				[ action.taxonomy ]: newTaxonomyTerms
			} );

			return merge( {}, state, {
				[ action.siteId ]: newSiteTaxonomies
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
	items
} );
