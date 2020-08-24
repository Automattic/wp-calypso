/**
 * External dependencies
 */
import { forIn, keys, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getThemeFilters } from 'state/themes/selectors/get-theme-filters';
import { getThemeFilterTermFromString } from 'state/themes/selectors/get-theme-filter-term-from-string';

import 'state/themes/init';

/**
 * Return a table of all theme filter terms indexed by
 * full 'taxonomy:term' strings.
 *
 * @param {object} state Global state tree
 * @returns {object} table of 'taxonomy:term' to 'term'
 */
export const getThemeFilterToTermTable = createSelector(
	( state ) => {
		const result = {};
		const taxonomies = mapValues( getThemeFilters( state ), keys );
		forIn( taxonomies, ( terms, taxonomy ) => {
			terms.forEach( ( term ) => {
				const key = `${ taxonomy }:${ term }`;
				result[ key ] = getThemeFilterTermFromString( state, key );
			} );
		} );
		return result;
	},
	( state ) => [ getThemeFilters( state ) ]
);
