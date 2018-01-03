/** @format */

/**
 * Internal dependencies
 */
import {
	I18N_LOCALE_SUGGESTIONS_SUCCESS,
	I18N_LOCALE_SUGGESTIONS_REQUEST,
} from 'state/action-types';

/**
 * Action creator function: I18N_LOCALE_SUGGESTIONS_SUCCESS
 *
 * @param {Object} items - list of locale suggestions
 * @return {Object} action object
 */
export const receiveLocaleSuggestions = items => ( {
	type: I18N_LOCALE_SUGGESTIONS_SUCCESS,
	items,
} );

/**
 * Action creator to request locale suggestions: I18N_LOCALE_SUGGESTIONS_SUCCESS
 *
 * @return {Object} action object
 */
export const requestLocaleSuggestions = () => {
	return {
		type: I18N_LOCALE_SUGGESTIONS_REQUEST,
	};
};
