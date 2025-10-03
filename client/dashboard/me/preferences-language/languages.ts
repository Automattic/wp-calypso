import { getLanguage, isLocaleVariant, canBeTranslated } from '@automattic/i18n-utils';
import languages from '@automattic/languages';
import type { Language, SubLanguage } from '@automattic/languages';

export type CalypsoLanguage = Language & {
	calypsoPercentTranslated: number;
	isTranslatedCompletely: boolean;
};
export type LanguageOption = {
	value: string;
	label: string;
};

export const languagesAsOptions = languages.map( ( lang: Language ) => {
	return {
		value: lang.langSlug,
		label: lang.name,
	};
} );

/**
 * Get the locale variant if the parentLangSlug is present
 */
export const getLocaleVariantOrLanguage = ( locale: string | undefined ): Language | undefined => {
	const language = getLanguage( locale );

	// if it's a variant, we want to link to the parent language
	if ( language && isLocaleVariant( language.langSlug ) ) {
		return getLanguage( ( language as SubLanguage ).parentLangSlug );
	}
	return language;
};

/**
 * Adapted from https://github.com/Automattic/wp-calypso/blob/fbeb9c37266e2bfac7af881b1672a9f6d72a0670/client/me/account/main.jsx#L299
 * In this case the data.language is the locale variant if we're using one, so we can skip the "isLocaleVariant checks and see if the locale can be translated or not"
 */
export const shouldDisplayCommunityTranslator = ( locale: string | undefined ): boolean => {
	if ( ! locale ) {
		return false;
	}
	// disable for locales
	if ( ! canBeTranslated( locale ) ) {
		return false;
	}

	return true;
};
