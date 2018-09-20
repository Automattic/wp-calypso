/** @format */

/**
 * Internal dependencies
 */
import { I18N_LOCALE_SUGGESTIONS_ADD, I18N_LOCALE_SUGGESTIONS_REQUEST } from 'state/action-types';

/**
 * Action creator function: I18N_LOCALE_SUGGESTIONS_ADD
 *
 * @param {Object} items - list of locale suggestions
 * @return {Object} action object
 */
export const receiveLocaleSuggestions = items => ( {
	type: I18N_LOCALE_SUGGESTIONS_ADD,
	items,
} );

/**
 * Action creator to request locale suggestions: I18N_LOCALE_SUGGESTIONS_REQUEST
 *
 * @return {Object} action object
 */
export const requestLocaleSuggestions = () => ( {
	type: I18N_LOCALE_SUGGESTIONS_REQUEST,
} );
