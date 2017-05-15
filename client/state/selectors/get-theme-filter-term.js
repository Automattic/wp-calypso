/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getThemeFilterTerms } from './';

/**
 * Returns theme filter term object.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  filter The filter slug
 * @param  {String}  term   The term slug
 * @return {Object}         A filter term object
 */
export default function getThemeFilterTerm( state, filter, term ) {
	return get( getThemeFilterTerms( state, filter ), term );
}
