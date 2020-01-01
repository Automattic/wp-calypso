/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getThemeFilterTerms from 'state/selectors/get-theme-filter-terms';

/**
 * Returns theme filter term object.
 *
 * @param  {object}  state  Global state tree
 * @param  {String}  filter The filter slug
 * @param  {String}  term   The term slug
 * @return {object}         A filter term object
 */
export default function getThemeFilterTerm( state, filter, term ) {
	return get( getThemeFilterTerms( state, filter ), term );
}
