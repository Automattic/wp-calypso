import { apiFetch } from '@wordpress/data-controls';
import { addQueryArgs } from '@wordpress/url';
import { setLocalizedLanguageNames } from './actions';
import { LANGUAGE_NAMES_URL } from './constants';
import type { LocalizedLanguageNames } from './types';
import type { APIFetchOptions } from '@wordpress/api-fetch';

export function* getLocalizedLanguageNames( locale: string ) {
	const localizedLanguageNames: LocalizedLanguageNames = yield apiFetch( {
		url: addQueryArgs( LANGUAGE_NAMES_URL, { _locale: locale } ),
		mode: 'cors',
	} as APIFetchOptions );

	yield setLocalizedLanguageNames( locale, localizedLanguageNames );
}
