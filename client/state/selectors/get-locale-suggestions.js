/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Returns an object of localized language names
 *
 * @param  {object}  state Global state tree
 * @returns {Array|Null} an array of guessed locales for the user
 */
export default function getLocaleSuggestions( state ) {
	return get( state, 'i18n.localeSuggestions', null );
}
