import { createSelector } from '@automattic/state-utils';
import { keys, mapValues } from 'lodash';
import { getThemeFilters } from 'calypso/state/themes/selectors/get-theme-filters';
import { isAmbiguousThemeFilterTerm } from 'calypso/state/themes/selectors/is-ambiguous-theme-filter-term';

import 'calypso/state/themes/init';

/**
 * Return a table of theme filter terms to taxonomies, with
 * ambiguous terms (terms in more than one tax) prefixed by taxonomy
 *
 * @param {Object} state Global state tree
 * @returns {Object} a table of terms to taxonomies.
 */
export const getThemeFilterTermsTable = createSelector(
	( state ) => {
		const termTable = {};
		const taxonomies = mapValues( getThemeFilters( state ), keys );
		Object.entries( taxonomies ).map( ( [ taxonomy, terms ] ) => {
			terms.forEach( ( term ) => {
				const key = isAmbiguousThemeFilterTerm( state, term ) ? `${ taxonomy }:${ term }` : term;
				termTable[ key ] = taxonomy;
			} );
		} );
		return termTable;
	},
	( state ) => [ getThemeFilters( state ) ]
);
