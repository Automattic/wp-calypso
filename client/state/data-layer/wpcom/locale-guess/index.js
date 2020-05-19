/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { I18N_LOCALE_SUGGESTIONS_REQUEST } from 'state/action-types';
import { receiveLocaleSuggestions } from 'state/i18n/locale-suggestions/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * @module state/data-layer/wpcom/locale-guess
 */

/**
 * Dispatches a request to /locale-guess to fetch locale suggestions
 *
 * @param {object} action Redux action
 * @returns {object} WordPress.com API HTTP Request action object
 */
export const fetchLocaleSuggestions = ( action ) =>
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
 * @param {object} action Redux action
 * @param {Array} data raw data from /locale-guess
 * @returns {object} Redux action
 */
export const addLocaleSuggestions = ( action, data ) => receiveLocaleSuggestions( data );

export const dispatchPlansRequest = dispatchRequest( {
	fetch: fetchLocaleSuggestions,
	onSuccess: addLocaleSuggestions,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/locale-guess/index.js', {
	[ I18N_LOCALE_SUGGESTIONS_REQUEST ]: [ dispatchPlansRequest ],
} );
