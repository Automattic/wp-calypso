/**
 * Internal dependencies
 */
import type { State } from './reducer';
import type { LocalizedLanguageNames } from './types';

export const getLocalizedLanguageNames = ( state: State ): LocalizedLanguageNames =>
	state.localizedLanguageNames;
