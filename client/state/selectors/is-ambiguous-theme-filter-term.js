/**
 * External dependencies
 */
import { filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getThemeFilters } from './';

/**
 * Whether a filter term slug is ambiguous
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  term   The term to check for ambiguity
 * @return {Bool}           True if term is ambiguous
 */
export default createSelector(
	( state, term ) => {
		const filters = getThemeFilters( state );

		const results = filter( filters, ( terms ) => (
			!! get( terms, term )
		) );

		return results.length > 1;
	},
	( state ) => [ getThemeFilters( state ) ]
);
