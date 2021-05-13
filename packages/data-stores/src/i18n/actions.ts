/**
 * Internal dependencies
 */
import type { LocalizedLanguageNames } from './types';

export const setLocalizedLanguageNames = (
	i18nLocale: string,
	localizedLanguageNames: LocalizedLanguageNames
) =>
	( {
		type: 'SET_LOCALIZED_LANGUAGE_NAMES' as const,
		localizedLanguageNames,
		i18nLocale,
	} as const );

export type I18nAction = ReturnType< typeof setLocalizedLanguageNames >;
