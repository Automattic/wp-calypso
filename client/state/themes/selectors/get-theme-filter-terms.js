/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getThemeFilters } from 'calypso/state/themes/selectors/get-theme-filters';

import 'calypso/state/themes/init';

/**
 * Returns the list of available terms for a given theme filter.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  filter The filter slug
 * @returns {object}         A list of filter terms, keyed by term slug
 */
export function getThemeFilterTerms( state, filter ) {
	return get( getThemeFilters( state ), filter );
}
