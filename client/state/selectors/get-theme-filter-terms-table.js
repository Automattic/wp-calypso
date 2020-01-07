/**
 * External dependencies
 */

import { forIn, keys, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getThemeFilters from 'state/selectors/get-theme-filters';
import isAmbiguousThemeFilterTerm from 'state/selectors/is-ambiguous-theme-filter-term';

/**
 * Return a table of theme filter terms to taxonomies, with
 * ambiguous terms (terms in more than one tax) prefixed by taxonomy
 *
 * @param {object} state Global state tree
 * @returns {object} a table of terms to taxonomies.
 */
export default createSelector(
	state => {
		const termTable = {};
		const taxonomies = mapValues( getThemeFilters( state ), keys );
		forIn( taxonomies, ( terms, taxonomy ) => {
			terms.forEach( term => {
				const key = isAmbiguousThemeFilterTerm( state, term ) ? `${ taxonomy }:${ term }` : term;
				termTable[ key ] = taxonomy;
			} );
		} );
		return termTable;
	},
	state => [ getThemeFilters( state ) ]
);
