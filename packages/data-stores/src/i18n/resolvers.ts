/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import type { APIFetchOptions } from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import { setLocalizedLanguageNames } from './actions';
import { LANGUAGE_NAMES_URL } from './constants';

export function* getLocalizedLanguageNames( locale: string ) {
	const localizedLanguageNames = yield apiFetch( {
		url: addQueryArgs( LANGUAGE_NAMES_URL, { _locale: locale } ),
		mode: 'cors',
	} as APIFetchOptions );

	yield setLocalizedLanguageNames( locale, localizedLanguageNames );
}
