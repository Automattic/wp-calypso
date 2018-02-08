/** @format */
/**
 * Internal dependencies
 */
import config from 'config';

// we cannot use the following export
// until we have stopped compiling into
// CommonJS modules through Babel due
// to an issue with Babel faking a default export
//
// export * from './utils';
export {
	addLocaleToPath,
	addLocaleToWpcomUrl,
	getLanguage,
	getLocaleFromPath,
	isDefaultLocale,
	removeLocaleFromPath,
} from './utils';

export const getLocaleSlug = () => config( 'i18n_default_locale_slug' );
