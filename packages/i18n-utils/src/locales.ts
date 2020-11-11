/**
 * The locale sets here map roughly to those found in locales.php
 *
 * todo: move these into @automattic/languages as another downloaded resource
 * todo: cleanup _shared.json - replace references to the below config options with imports from here
 */
export type Locale = string;
export const i18nDefaultLocaleSlug: Locale = 'en';
export const localesWithBlog: Locale[] = [ 'en', 'ja', 'es', 'pt', 'fr', 'pt-br' ];
export const localesWithPrivacyPolicy: Locale[] = [ 'en', 'fr', 'de' ];
export const localesWithCookiePolicy: Locale[] = [ 'en', 'fr', 'de' ];

type LocaleSubdomain = string;

export const localesToSubdomains: Record< string, LocaleSubdomain > = {
	'pt-br': 'br',
	br: 'bre',
	zh: 'zh-cn',
	'zh-hk': 'zh-tw',
	'zh-sg': 'zh-cn',
	kr: 'ko',
};

// replaces config( 'english_locales' )
export const englishLocales: Locale[] = [ 'en', 'en-gb' ];

// replaces config( 'livechat_support_locales' )
export const livechatSupportLocales: Locale[] = [ 'en', 'es', 'pt-br' ];

// replaces config( 'support_site_locales' )
export const supportSiteLocales: Locale[] = [
	'ar',
	'de',
	'en',
	'es',
	'fr',
	'he',
	'id',
	'it',
	'ja',
	'ko',
	'nl',
	'pt-br',
	'ru',
	'sv',
	'tr',
	'zh-cn',
	'zh-tw',
];

// replaces config( 'forum_locales')
export const forumLocales: Locale[] = [
	'ar',
	'de',
	'el',
	'en',
	'es',
	'fa',
	'fi',
	'fr',
	'id',
	'it',
	'ja',
	'nl',
	'pt',
	'pt-br',
	'ru',
	'sv',
	'th',
	'tl',
	'tr',
];

// replaces config( 'magnificent_non_en_locales')
export const magnificentNonEnLocales: Locale[] = [
	'es',
	'pt-br',
	'de',
	'fr',
	'he',
	'ja',
	'it',
	'nl',
	'ru',
	'tr',
	'id',
	'zh-cn',
	'zh-tw',
	'ko',
	'ar',
	'sv',
];

// replaces config( 'jetpack_com_locales')
export const jetpackComLocales: Locale[] = [
	'en',
	'ar',
	'de',
	'es',
	'fr',
	'he',
	'id',
	'it',
	'ja',
	'ko',
	'nl',
	'pt-br',
	'ro',
	'ru',
	'sv',
	'tr',
	'zh-cn',
	'zh-tw',
];
