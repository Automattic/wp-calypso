/**
 * Translation loader for agenttic pacakges using pre-parsed translation objects
 */

import { setLocaleData } from '@wordpress/i18n';
import { getBundledTranslation } from '../assets/translations';

/**
 * Configuration for translation loading
 */
interface TranslationConfig {
	domain?: string;
}

/**
 * Load translations from pre-parsed translation objects
 *
 * @param locale - Language locale (e.g., 'es', 'fr', 'de-DE')
 * @param config - Translation configuration
 * @return boolean - Success status
 */
function loadJSONFromLocal(
	locale: string,
	config: TranslationConfig
): boolean {
	const { domain = 'a8c-agenttic' } = config;

	try {
		// Get pre-parsed translation data directly
		const translationData = getBundledTranslation( locale );
		if ( ! translationData ) {
			// eslint-disable-next-line no-console
			console.warn( `Translations unavailable for locale: ${ locale }` );
			return false;
		}

		// Jed format: extract locale_data.messages which is ready for WordPress
		const jedData = translationData.locale_data?.messages;
		if ( jedData ) {
			const CONTEXT_DELIMITER = '\u0004';

			// Process Jed data: strip context prefix and preserve metadata
			const processedData = Object.fromEntries(
				Object.entries( jedData ).map( ( [ key, value ] ) => {
					if ( key === '' ) {
						// Preserve metadata with correct domain
						return [
							'',
							{
								...jedData[ '' ],
								domain,
								lang: jedData[ '' ]?.lang || locale,
							},
						];
					}

					// Strip everything before and including the delimiter
					const delimiterIndex = key.indexOf( CONTEXT_DELIMITER );
					const cleanKey =
						delimiterIndex > -1
							? key.slice( delimiterIndex + 1 )
							: key;
					return [ cleanKey, value ];
				} )
			);

			setLocaleData( processedData, domain );
		} else {
			// Fallback for non-Jed format
			setLocaleData( translationData, domain );
		}
		return true;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn(
			`Failed to load bundled translations for locale: ${ locale }`,
			error
		);
		return false;
	}
}

/**
 * Load translations for agenttic packages from pre-parsed objects
 *
 * @param locale - Language locale (e.g., 'es', 'fr', 'de-DE'). Defaults to en.
 * @param config - Translation configuration
 * @return boolean - Success status
 */
export function loadAgentticTranslations(
	locale: string = 'en',
	config: TranslationConfig = {}
): boolean {
	// Skip loading for English - use default English strings
	if ( locale === 'en' ) {
		return true;
	}

	// Try embedded translations
	try {
		const success = loadJSONFromLocal( locale, config );
		if ( success ) {
			return true;
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn(
			`Translation loading failed for locale ${ locale }`,
			error
		);
	}
	return false;
}
