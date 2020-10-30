/**
 * Internal dependencies
 */
import type { LocalizedLanguageNames } from './types';

export const setLocalizedLanguageNames = ( localizedLanguageNames: LocalizedLanguageNames ) =>
	( {
		type: 'SET_LOCALIZED_LANGUAGE_NAMES' as const,
		localizedLanguageNames,
	} as const );

export type I18nAction = ReturnType< typeof setLocalizedLanguageNames >;
