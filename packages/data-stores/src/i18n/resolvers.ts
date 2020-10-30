/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import type { APIFetchOptions } from '@wordpress/api-fetch';

import { setLocalizedLanguageNames } from './actions';

export function* getLocalizedLanguageNames() {
	const localizedLanguageNames = yield apiFetch( {
		url: 'https://public-api.wordpress.com/wpcom/v2/i18n/language-names',
		credentials: 'include',
		mode: 'cors',
	} as APIFetchOptions );

	yield setLocalizedLanguageNames( localizedLanguageNames );
}
