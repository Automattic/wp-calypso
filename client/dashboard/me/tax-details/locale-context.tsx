import * as i18n from '@wordpress/i18n';
type Locale = string;

/**
 * Returns locale slug
 * @param {string} locale locale to be converted e.g. "en_US".
 * @returns locale string e.g. "en"
 */
function mapWpI18nLangToLocaleSlug( locale: Locale = '' ): Locale {
	if ( ! locale ) {
		return '';
	}

	const TARGET_LOCALES = [ 'pt_br', 'pt-br', 'zh_tw', 'zh-tw', 'zh_cn', 'zh-cn', 'zh_sg', 'zh-sg' ];
	const lowerCaseLocale = locale.toLowerCase();
	const formattedLocale = TARGET_LOCALES.includes( lowerCaseLocale )
		? lowerCaseLocale.replace( '_', '-' )
		: lowerCaseLocale.replace( /([-_].*)$/i, '' );

	return formattedLocale || 'en';
}

/**
 * Get the lang from the @wordpress/i18n locale data
 * @returns lang e.g. "en_US"
 */
function getWpI18nLocaleLang(): string | undefined {
	const localeData = i18n.getLocaleData() || {};
	return localeData[ '' ]?.lang || localeData[ '' ]?.language || '';
}

/**
 * Get the lang from the @wordpress/i18n locale data and map the value to the locale slug
 * @returns lang e.g. "en", "pt-br", "zh-tw"
 */
export function getWpI18nLocaleSlug(): string | undefined {
	const language = getWpI18nLocaleLang();
	return mapWpI18nLangToLocaleSlug( language );
}
