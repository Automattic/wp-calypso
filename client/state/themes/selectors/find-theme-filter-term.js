import { createSelector } from '@automattic/state-utils';
import { filter, get } from 'lodash';
import { getThemeFilterTerm } from 'calypso/state/themes/selectors/get-theme-filter-term';
import { getThemeFilters } from 'calypso/state/themes/selectors/get-theme-filters';

import 'calypso/state/themes/init';

/**
 * Returns a theme filter term object that corresponds to a given filter term slug
 *
 * @param  {Object}  state  Global state tree
 * @param  {string}  search The term to search for
 * @returns {Object}         A filter term object
 */
export const findThemeFilterTerm = createSelector(
	( state, search ) => {
		const [ left, right ] = search.split( ':' );
		if ( right ) {
			return getThemeFilterTerm( state, left, right );
		}

		const filters = getThemeFilters( state );

		const results = filter( filters, ( terms ) => !! get( terms, left ) );

		if ( results.length !== 1 ) {
			// No or ambiguous results
			return null;
		}
		return results[ 0 ][ left ];
	},
	( state ) => [ getThemeFilters( state ) ]
);
