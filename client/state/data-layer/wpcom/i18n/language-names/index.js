/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { I18N_LANGUAGE_NAMES_REQUEST } from 'state/action-types';
import {
	receiveLanguageNames,
	requestLanguageNamesFailed,
} from 'state/i18n/language-names/actions';

/**
 * @module state/data-layer/wpcom/i18n/language-names
 */

/**
 * Dispatches a request to fetch localized language names
 *
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const fetchLanguageNames = action =>
	http(
		{
			method: 'GET',
			path: '/i18n/languages/names',
			apiNamespace: 'wpcom/v2',
		},
		action
	);
/**
 * Dispatches returned localized language names data
 *
 * @param {Object} action Redux action
 * @param {Array} data raw data from i18n/language-names
 * @returns {Array<Object>} Redux actions
 */
export const fetchLanguageNamesSuccess = ( action, data ) => [ receiveLanguageNames( data ) ];

/**
 * Dispatches returned error from localized language names  request
 *
 * @param {Object} action Redux action
 * @param {Object} rawError raw error from HTTP request
 * @returns {Object} Redux action
 */
export const fetchLanguageNamesError = ( action, rawError ) =>
	requestLanguageNamesFailed( rawError instanceof Error ? rawError.message : rawError );

export const dispatchPlansRequest = dispatchRequestEx( {
	fetch: fetchLanguageNames,
	onSuccess: fetchLanguageNamesSuccess,
	onError: fetchLanguageNamesError,
} );

export default {
	[ I18N_LANGUAGE_NAMES_REQUEST ]: [ dispatchPlansRequest ],
};
