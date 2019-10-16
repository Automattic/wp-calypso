/**
 * External dependencies
 */
import { getLocaleSlug as i18nGetLocaleSlug } from 'i18n-calypso';

export {
	addLocaleToPath,
	getLanguage,
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
} from './utils';

export const getLocaleSlug = () => i18nGetLocaleSlug();
