/**
 * Internal dependencies
 */
import { I18N_LOCALE_SUGGESTIONS_ADD, I18N_LOCALE_SUGGESTIONS_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/locale-guess';

/**
 * Action creator function: I18N_LOCALE_SUGGESTIONS_ADD
 *
 * @param {object} items - list of locale suggestions
 * @returns {object} action object
 */
export const receiveLocaleSuggestions = ( items ) => ( {
	type: I18N_LOCALE_SUGGESTIONS_ADD,
	items,
} );

/**
 * Action creator to request locale suggestions: I18N_LOCALE_SUGGESTIONS_REQUEST
 *
 * @returns {object} action object
 */
export const requestLocaleSuggestions = () => ( {
	type: I18N_LOCALE_SUGGESTIONS_REQUEST,
} );
