/**
 * Internal dependencies
 */
import { I18N_LANGUAGE_NAMES_REQUEST, I18N_LANGUAGE_NAMES_ADD } from 'state/action-types';

import 'state/data-layer/wpcom/i18n/language-names';

/**
 * Action creator function: I18N_LANGUAGE_NAMES_ADD
 *
 * @param {object} items - list of localized language names
 * @returns {object} action object
 */
export const receiveLanguageNames = ( items ) => ( {
	type: I18N_LANGUAGE_NAMES_ADD,
	items,
} );

/**
 * Action creator to request localized language names: I18N_LANGUAGE_NAMES_REQUEST
 *
 * @returns {object} action object
 */
export const requestLanguageNames = () => {
	return {
		type: I18N_LANGUAGE_NAMES_REQUEST,
	};
};
