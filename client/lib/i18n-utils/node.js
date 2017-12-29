/** @format */
/**
 * Internal dependencies
 */
import config from 'config';

export {
	addLocaleToPath,
	addLocaleToWpcomUrl,
	getLanguage,
	getLocaleFromPath,
	isDefaultLocale,
	removeLocaleFromPath,
} from './utils';

export const getLocaleSlug = () => config( 'i18n_default_locale_slug' );
