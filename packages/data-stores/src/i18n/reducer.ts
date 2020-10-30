/**
 * Internal dependencies
 */
import type { I18nAction } from './actions';
import type { LocalizedLanguageNames } from './types';

export type State = {
	localizedLanguageNames: LocalizedLanguageNames;
};

const DEFAULT_STATE: State = { localizedLanguageNames: {} };

const reducer = ( state = DEFAULT_STATE, action: I18nAction ): State => {
	switch ( action.type ) {
		case 'SET_LOCALIZED_LANGUAGE_NAMES':
			return {
				...state,
				localizedLanguageNames: action.localizedLanguageNames,
			};
		default:
			return state;
	}
};

export default reducer;
