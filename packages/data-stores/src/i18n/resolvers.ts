/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import type { APIFetchOptions } from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import { setLocalizedLanguageNames } from './actions';
import { LANGUAGE_NAMES_URL } from './constants';
import type { LocalizedLanguageNames } from './types';

export function* getLocalizedLanguageNames( locale: string ) {
	const localizedLanguageNames: LocalizedLanguageNames = yield apiFetch( {
		url: addQueryArgs( LANGUAGE_NAMES_URL, { _locale: locale } ),
		mode: 'cors',
	} as APIFetchOptions );

	yield setLocalizedLanguageNames( locale, localizedLanguageNames );
}
