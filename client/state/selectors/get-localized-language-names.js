/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/i18n/init';

/**
 * Returns an object of localized language names
 *
 * @param  {object}  state Global state tree
 * @returns {object|null} an object of localized language names or null if no names are found
 */
export default function getLocalizedLanguageNames( state ) {
	return get( state, 'i18n.languageNames.items', null );
}
