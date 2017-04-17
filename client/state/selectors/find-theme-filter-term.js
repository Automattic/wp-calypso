/**
 * External dependencies
 */
import { find, some } from 'lodash';

/**
 * Internal dependencies
 */
import { getThemeFilters, getThemeFilterTerm } from './';

/**
 * Returns a theme filter term object that corresponds to a given filter term slug
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  search The term to search for
 * @return {Object}         A filter term object
 */
export default function findThemeFilterTerm( state, search ) {
	const [ left, right ] = search.split( ':' );
	if ( right ) {
		return getThemeFilterTerm( state, left, right );
	}

	const filters = getThemeFilters( state );

	let ret;
	some( filters, ( terms ) => {
		ret = find( terms, ( value, term ) => ( term === left ) );
		return !! ret;
	} );
	return ret;
}
