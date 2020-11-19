/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import type { APIFetchOptions } from '@wordpress/api-fetch';

import { setLocalizedLanguageNames } from './actions';

export function* getLocalizedLanguageNames( locale: string ) {
	const localizedLanguageNames = yield apiFetch( {
		// Forcefully add `_locale` here because the `data` parameter will re-write it as
		// just `locale` (no underscore). Context here:
		// https://github.com/Automattic/wp-calypso/pull/46328#discussion_r515674976
		url: `https://public-api.wordpress.com/wpcom/v2/i18n/language-names?_locale=${ locale }`,
		mode: 'cors',
	} as APIFetchOptions );

	yield setLocalizedLanguageNames( locale, localizedLanguageNames );
}
