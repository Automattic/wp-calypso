/** @format */
/**
 * Internal dependencies
 */
import { findThemeFilterTerm } from './';

/**
 * Whether a filter term slug is valid
 *
 * @param  {Object}  state Global state tree
 * @param  {String}  term  The term to validate
 * @return {Bool}          True if term is valid
 */
export default function isValidThemeFilterTerm( state, term ) {
	return !! findThemeFilterTerm( state, term );
}
