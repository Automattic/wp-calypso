import { I18N_LOCALE_SUGGESTIONS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveLocaleSuggestions } from 'calypso/state/i18n/locale-suggestions/actions';

const noop = () => {};

/**
 * @module state/data-layer/wpcom/locale-guess
 */

/**
 * Dispatches a request to /locale-guess to fetch locale suggestions
 *
 * @param {Object} action Redux action
 * @returns {Object} WordPress.com API HTTP Request action object
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
 * @param {Object} action Redux action
 * @param {Array} data raw data from /locale-guess
 * @returns {Object} Redux action
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
