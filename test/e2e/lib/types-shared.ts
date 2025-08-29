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
 *
 * TODO: We should ideally use `packages/i18n-utils/src/locales.ts#L110` instead of duplicating this list.
 * Need to resolve esm / cjs interop first.
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
