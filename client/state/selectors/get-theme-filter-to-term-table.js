/** @format */
/**
 * External dependencies
 */
import { forIn, keys, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getThemeFilters, getThemeFilterTermFromString } from 'state/selectors';

/**
 * Return a table of all theme filter terms indexed by
 * full 'taxonomy:term' strings.
 *
 * @param {Object} state Global state tree
 * @return {Object} table of 'taxonomy:term' to 'term'
 */
export default createSelector(
	state => {
		const result = {};
		const taxonomies = mapValues( getThemeFilters( state ), keys );
		forIn( taxonomies, ( terms, taxonomy ) => {
			terms.forEach( term => {
				const key = `${ taxonomy }:${ term }`;
				result[ key ] = getThemeFilterTermFromString( state, key );
			} );
		} );
		return result;
	},
	state => [ getThemeFilters( state ) ]
);
