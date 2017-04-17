/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getThemeFilters } from './';

/**
 * Returns the list of available terms for a given theme filter.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  filter The filter slug
 * @return {Object}         A list of filter terms, keyed by term slug
 */
export default function getThemeFilterTerms( state, filter ) {
	return get( getThemeFilters( state ), filter );
}
