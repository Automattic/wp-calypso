/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { I18N_LANGUAGE_NAMES_REQUEST } from 'state/action-types';
import { receiveLanguageNames } from 'state/i18n/language-names/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * @module state/data-layer/wpcom/i18n/language-names
 */

/**
 * Dispatches a request to fetch localized language names
 *
 * @param {object} action Redux action
 * @returns {object} original action
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
 * @param {object} action Redux action
 * @param {Array} data raw data from i18n/language-names
 * @returns {Array<object>} Redux actions
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
