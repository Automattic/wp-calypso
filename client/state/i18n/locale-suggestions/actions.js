import {
	I18N_LOCALE_SUGGESTIONS_ADD,
	I18N_LOCALE_SUGGESTIONS_REQUEST,
} from 'calypso/state/action-types';

import 'calypso/state/i18n/init';
import 'calypso/state/data-layer/wpcom/locale-guess';

/**
 * Action creator function: I18N_LOCALE_SUGGESTIONS_ADD
 *
 * @param {Object} items - list of locale suggestions
 * @returns {Object} action object
 */
export const receiveLocaleSuggestions = ( items ) => ( {
	type: I18N_LOCALE_SUGGESTIONS_ADD,
	items,
} );

/**
 * Action creator to request locale suggestions: I18N_LOCALE_SUGGESTIONS_REQUEST
 *
 * @returns {Object} action object
 */
export const requestLocaleSuggestions = () => ( {
	type: I18N_LOCALE_SUGGESTIONS_REQUEST,
} );
