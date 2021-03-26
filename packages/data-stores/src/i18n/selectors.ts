/**
 * Internal dependencies
 */
import type { State } from './reducer';
import type { LocalizedLanguageNames } from './types';

export const getLocalizedLanguageNames = (
	state: State,
	i18nLocale: string
): LocalizedLanguageNames => state?.localizedLanguageNames?.[ i18nLocale ];
