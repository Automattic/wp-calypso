import { I18N_LANGUAGE_NAMES_REQUEST, I18N_LANGUAGE_NAMES_ADD } from 'calypso/state/action-types';

import 'calypso/state/i18n/init';
import 'calypso/state/data-layer/wpcom/i18n/language-names';

/**
 * Action creator function: I18N_LANGUAGE_NAMES_ADD
 *
 * @param {Object} items - list of localized language names
 * @returns {Object} action object
 */
export const receiveLanguageNames = ( items ) => ( {
	type: I18N_LANGUAGE_NAMES_ADD,
	items,
} );

/**
 * Action creator to request localized language names: I18N_LANGUAGE_NAMES_REQUEST
 *
 * @returns {Object} action object
 */
export const requestLanguageNames = () => {
	return {
		type: I18N_LANGUAGE_NAMES_REQUEST,
	};
};
