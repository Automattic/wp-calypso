import { get } from 'lodash';
import { getThemeFilterTerms } from 'calypso/state/themes/selectors/get-theme-filter-terms';

import 'calypso/state/themes/init';

/**
 * Returns theme filter term object.
 *
 * @param  {Object}  state  Global state tree
 * @param  {string}  filter The filter slug
 * @param  {string}  term   The term slug
 * @returns {Object}         A filter term object
 */
export function getThemeFilterTerm( state, filter, term ) {
	return get( getThemeFilterTerms( state, filter ), term );
}
