/**
 * External dependencies
 */
import { setLocaleData } from '@wordpress/i18n';

// Language codes where the full locale slug (with region) should be preserved
// because the base language code has no translation file or the regional
// variants are distinct. Matches the pattern used in odyssey-stats and
// blaze-dashboard.
const ALWAYS_LOAD_WITH_LOCALE = [ 'pt', 'zh' ];

const DEFAULT_LANGUAGE = 'en';

/**
 * Fetch JSON translations from CDN and apply them via @wordpress/i18n.
 *
 * Resolves silently on any error so the app falls back to English strings.
 *
 * @param {string} localeSlug - Locale slug (e.g. "it", "zh-tw").
 */
export default async function setLocale( localeSlug ) {
	if ( ! localeSlug ) {
		return;
	}

	const languageCode = localeSlug.split( '-' )[ 0 ];

	if ( languageCode === DEFAULT_LANGUAGE ) {
		return;
	}

	const languageFileName = ALWAYS_LOAD_WITH_LOCALE.includes( languageCode )
		? localeSlug
		: languageCode;

	const url = `https://widgets.wp.com/agents-manager/languages/${ languageFileName }-v1.1.json`;

	try {
		const response = await fetch( url );

		if ( response.ok ) {
			const body = await response.json();

			if ( body ) {
				setLocaleData( body );
			}
		}
	} catch {
		// Silently fall back to English.
	}
}
