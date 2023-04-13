import { I18N_LANGUAGE_NAMES_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveLanguageNames } from 'calypso/state/i18n/language-names/actions';

const noop = () => {};

/**
 * @module state/data-layer/wpcom/i18n/language-names
 */

/**
 * Dispatches a request to fetch localized language names
 *
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const fetchLanguageNames = ( action ) =>
	http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/i18n/language-names',
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
export const addLanguageNames = ( action, data ) => [ receiveLanguageNames( data ) ];

export const dispatchPlansRequest = dispatchRequest( {
	fetch: fetchLanguageNames,
	onSuccess: addLanguageNames,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/i18n/language-names/index.js', {
	[ I18N_LANGUAGE_NAMES_REQUEST ]: [ dispatchPlansRequest ],
} );
