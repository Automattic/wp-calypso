import { get } from 'lodash';

import 'calypso/state/i18n/init';

/**
 * Returns an object of localized language names
 *
 * @param  {Object}  state Global state tree
 * @returns {Object | null} an object of localized language names or null if no names are found
 */
export default function getLocalizedLanguageNames( state ) {
	return get( state, 'i18n.languageNames.items', null );
}
