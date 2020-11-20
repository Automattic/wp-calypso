/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import type { APIFetchOptions } from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import { setLocalizedLanguageNames } from './actions';

export function* getLocalizedLanguageNames( locale: string ) {
	const url = 'https://public-api.wordpress.com/wpcom/v2/i18n/language-names';

	const localizedLanguageNames = yield apiFetch( {
		url: addQueryArgs( url, { _locale: locale } ),
		mode: 'cors',
	} as APIFetchOptions );

	yield setLocalizedLanguageNames( locale, localizedLanguageNames );
}
