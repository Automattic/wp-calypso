/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getThemeFilterTerms } from 'calypso/state/themes/selectors/get-theme-filter-terms';

import 'calypso/state/themes/init';

/**
 * Returns theme filter term object.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  filter The filter slug
 * @param  {string}  term   The term slug
 * @returns {object}         A filter term object
 */
export function getThemeFilterTerm( state, filter, term ) {
	return get( getThemeFilterTerms( state, filter ), term );
}
