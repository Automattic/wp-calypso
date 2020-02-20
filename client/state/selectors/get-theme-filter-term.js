/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getThemeFilterTerms from 'state/selectors/get-theme-filter-terms';

import 'state/themes/init';

/**
 * Returns theme filter term object.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  filter The filter slug
 * @param  {string}  term   The term slug
 * @returns {object}         A filter term object
 */
export default function getThemeFilterTerm( state, filter, term ) {
	return get( getThemeFilterTerms( state, filter ), term );
}
