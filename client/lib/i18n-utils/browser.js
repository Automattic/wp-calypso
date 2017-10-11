/**
 * External dependencies
 *
 * @format
 */

import i18n from 'i18n-calypso';
import {
	isDefaultLocale,
	getLanguage,
	getLocaleFromPath,
	addLocaleToPath,
	addLocaleToWpcomUrl,
	removeLocaleFromPath,
} from './utils';

export default {
	isDefaultLocale,
	getLanguage,
	getLocaleFromPath,
	addLocaleToPath,
	addLocaleToWpcomUrl,
	removeLocaleFromPath,
};

export {
	isDefaultLocale,
	getLanguage,
	getLocaleFromPath,
	addLocaleToPath,
	addLocaleToWpcomUrl,
	removeLocaleFromPath,
};

export const getLocaleSlug = function() {
	return i18n.getLocaleSlug();
};
