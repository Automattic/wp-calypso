/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';

// we cannot use the following export
// until we have stopped compiling into
// CommonJS modules through Babel due
// to an issue with Babel faking a default export
//
// export * from './utils';
export {
	addLocaleToPath,
	getLanguage,
	getLanguageRouteParam,
	getLanguageSlugs,
	getLocaleFromPath,
	isDefaultLocale,
	isLocaleVariant,
	isLocaleRtl,
	localizeUrl,
	canBeTranslated,
	removeLocaleFromPath,
	getPathParts,
	filterLanguageRevisions,
	translationExists,
	isMagnificentLocale,
	isTranslatedIncompletely,
} from './utils';

export const getLocaleSlug = () => config( 'i18n_default_locale_slug' );
