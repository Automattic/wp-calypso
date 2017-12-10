/** @format */

/**
 * Internal dependencies
 */
import {
	I18N_LANGUAGE_NAMES_REQUEST,
	I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
	I18N_LANGUAGE_NAMES_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Action creator function: I18N_LANGUAGE_NAMES_REQUEST_SUCCESS
 *
 * @param {Object} items - list of localized language names
 * @return {Object} action object
 */
export const receiveLanguageNames = items => ( {
	type: I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
	items,
} );

/**
 * Action creator function: I18N_LANGUAGE_NAMES_REQUEST_FAILURE
 *
 * @param {String} error - error message
 * @return {Object} action object
 */
export const requestLanguageNamesFailed = error => {
	return {
		type: I18N_LANGUAGE_NAMES_REQUEST_FAILURE,
		error,
	};
};

/**
 * Action creator to request localized language names: I18N_LANGUAGE_NAMES_REQUEST
 *
 * @return {Object} action object
 */
export const requestLanguageNames = () => {
	return {
		type: I18N_LANGUAGE_NAMES_REQUEST,
	};
};
