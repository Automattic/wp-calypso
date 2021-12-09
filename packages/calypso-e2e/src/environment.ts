export const COOKIES_PATH = process.env.COOKIES_PATH ?? '';

/**
 * List of locales, used in i18n testing.
 *
 * @returns {string[]} Array of lowercase strings.
 */
export const LOCALES = (): string[] => {
	const locales = process.env.LOCALES ?? '';
	return locales.split( ',' ).map( ( locale ) => locale.toLowerCase() );
};
