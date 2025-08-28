/**
 * Represents the supported locale codes for testing purposes.
 *
 * - 'ar': Arabic
 * - 'de': German
 * - 'en': English
 * - 'es': Spanish
 * - 'fr': French
 * - 'he': Hebrew
 * - 'id': Indonesian
 * - 'it': Italian
 * - 'ja': Japanese
 * - 'ko': Korean
 * - 'nl': Dutch
 * - 'pt-br': Portuguese (Brazil)
 * - 'ru': Russian
 * - 'sv': Swedish
 * - 'tr': Turkish
 * - 'zh-cn': Chinese (Simplified)
 * - 'zh-tw': Chinese (Traditional)
 */
export type locale =
	| 'ar'
	| 'de'
	| 'en'
	| 'es'
	| 'fr'
	| 'he'
	| 'id'
	| 'it'
	| 'ja'
	| 'ko'
	| 'nl'
	| 'pt-br'
	| 'ru'
	| 'sv'
	| 'tr'
	| 'zh-cn'
	| 'zh-tw';

/**
 * Represents a translation object for a specific language.
 *
 * @property {locale} locale - The locale code corresponding to the translation.
 * @property {string} addTitle - The translated string for the "add title" label.
 */
export interface Translation {
	locale: locale;
	addTitle: string;
}
