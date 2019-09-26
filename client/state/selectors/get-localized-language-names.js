/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Returns an object of localized language names
 *
 * @param  {Object}  state Global state tree
 * @returns {Object|Null} an object of localized language names or null if no names are found
 */
export default function getLocalizedLanguageNames( state ) {
	return get( state, 'i18n.languageNames.items', null );
}
