/**
 * External dependencies
 *
 * @format
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 *
 */
import {
	isDefaultLocale,
	getLanguage,
	getLocaleFromPath,
	addLocaleToPath,
	addLocaleToWpcomUrl,
	removeLocaleFromPath,
} from './utils';

const getLocaleSlug = function() {
	return i18n.getLocaleSlug();
};

export default {
	isDefaultLocale,
	getLanguage,
	getLocaleFromPath,
	getLocaleSlug,
	addLocaleToPath,
	addLocaleToWpcomUrl,
	removeLocaleFromPath,
};

export {
	isDefaultLocale,
	getLanguage,
	getLocaleFromPath,
	getLocaleSlug,
	addLocaleToPath,
	addLocaleToWpcomUrl,
	removeLocaleFromPath,
};
