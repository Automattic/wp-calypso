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
	isDefaultLocale,
	removeLocaleFromPath,
} from './utils';

export const getLocaleSlug = () => i18n.getLocaleSlug();
