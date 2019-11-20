/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveVerticals } from './actions';
import { getLanguage } from 'lib/i18n-utils';

/**
 * Fetch verticals from the verticals endpoint.
 *
 * Note: As long as all verticals are fetched (no search provided),
 * the Vertical type used in receiveVerticals should be correct.
 * However, if a search term is provided, the API may provide a
 * different type of vertical representing the search.
 *
 * At this time no validation or normalization is happening on the
 * API response.
 */
export function* getVerticals() {
	const url = 'https://public-api.wordpress.com/wpcom/v2/verticals';
	let locale;
	if ( ! locale && typeof navigator === 'object' && 'languages' in navigator ) {
		for ( const langSlug of navigator.languages ) {
			const language = getLanguage( langSlug.toLowerCase() );
			if ( language ) {
				locale = language.langSlug;
				break;
			}
		}
	}

	let localeQueryParam;
	if ( locale && locale !== 'en' ) {
		// v2 api request
		localeQueryParam = { _locale: locale };
	}

	const verticals = yield apiFetch( { url: addQueryArgs( url, localeQueryParam ) } );

	// @TODO: validate and normalize verticals?

	return receiveVerticals( verticals );
}
