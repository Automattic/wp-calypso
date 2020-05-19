/**
 * External dependencies
 */
import { filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getThemeFilters } from 'state/themes/selectors/get-theme-filters';

import 'state/themes/init';

/**
 * Returns true if a theme filter term belongs to more
 * than one taxonomy.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  term   The term to check for ambiguity
 * @returns {boolean}           True if term is ambiguous
 */
export const isAmbiguousThemeFilterTerm = createSelector(
	( state, term ) => {
		const filters = getThemeFilters( state );

		const results = filter( filters, ( terms ) => !! get( terms, term ) );

		return results.length > 1;
	},
	( state ) => [ getThemeFilters( state ) ]
);
