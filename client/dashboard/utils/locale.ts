/**
 * Converts a WordPress.com locale slug into a language tag that `Intl`
 * accepts.
 *
 * Locale slugs are not always valid BCP 47: variants are appended with an
 * underscore (`sr_latin`, `de_formal`, `nl_formal`), and `Intl` constructors
 * throw a `RangeError` on those. Falls back to English.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag
 */
export function getIntlLocale( locale?: string | null ): string {
	if ( ! locale ) {
		return 'en';
	}

	const tag = locale.replace( /_/g, '-' );

	try {
		Intl.getCanonicalLocales( tag );
		return tag;
	} catch {
		return 'en';
	}
}
