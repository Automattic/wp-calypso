import i18n from 'i18n-calypso';

export {
	isDefaultLocale,
	localizeUrl,
	canBeTranslated,
	translationExists,
	isMagnificentLocale,
} from './utils';

export const getLocaleSlug = () => i18n.getLocaleSlug();
