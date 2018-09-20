/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

export {
	addLocaleToPath,
	addLocaleToWpcomUrl,
	getForumUrl,
	getLanguage,
	getLanguageSlugs,
	getLocaleFromPath,
	getSupportSiteLocale,
	isDefaultLocale,
	isLocaleVariant,
	canBeTranslated,
	removeLocaleFromPath,
	getPathParts,
} from './utils';

export const getLocaleSlug = () => i18n.getLocaleSlug();
