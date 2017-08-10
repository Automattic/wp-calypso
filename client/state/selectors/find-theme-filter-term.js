/** @format */
/**
 * External dependencies
 */
import { filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getThemeFilters, getThemeFilterTerm } from './';

/**
 * Returns a theme filter term object that corresponds to a given filter term slug
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  search The term to search for
 * @return {Object}         A filter term object
 */
export default createSelector(
	( state, search ) => {
		const [ left, right ] = search.split( ':' );
		if ( right ) {
			return getThemeFilterTerm( state, left, right );
		}

		const filters = getThemeFilters( state );

		const results = filter( filters, terms => !! get( terms, left ) );

		if ( results.length !== 1 ) {
			// No or ambiguous results
			return null;
		}
		return results[ 0 ][ left ];
	},
	state => [ getThemeFilters( state ) ]
);
