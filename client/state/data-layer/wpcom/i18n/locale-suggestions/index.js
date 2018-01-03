/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { I18N_LOCALE_SUGGESTIONS_REQUEST } from 'state/action-types';
import { receiveLocaleSuggestions } from 'state/i18n/locale-suggestions/actions';

/**
 * @module state/data-layer/wpcom/i18n/locale-suggestions
 */

/**
 * Dispatches a request to fetch locale suggestions
 *
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const fetchLocaleSuggestions = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/locale-guess',
		},
		action
	);
/**
 * Dispatches returned locale suggestions data
 *
 * @param {Object} action Redux action
 * @param {Array} data raw data from /locale-guess
 * @returns {Object} Redux action
 */
export const localeSuggestionsReceive = ( action, data ) => receiveLocaleSuggestions( data );

export const dispatchPlansRequest = dispatchRequestEx( {
	fetch: fetchLocaleSuggestions,
	onSuccess: localeSuggestionsReceive,
	onError: noop,
} );

export default {
	[ I18N_LOCALE_SUGGESTIONS_REQUEST ]: [ dispatchPlansRequest ],
};
