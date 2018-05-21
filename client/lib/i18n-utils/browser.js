/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

export {
	addLocaleToPath,
	addLocaleToWpcomUrl,
	getLanguage,
	getLocaleFromPath,
	getSupportLocale,
	isDefaultLocale,
	isLocaleVariant,
	canBeTranslated,
	removeLocaleFromPath,
} from './utils';

export const getLocaleSlug = () => i18n.getLocaleSlug();
