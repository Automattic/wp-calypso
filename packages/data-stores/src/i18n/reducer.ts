/**
 * Internal dependencies
 */
import type { I18nAction } from './actions';
import type { LocalizedLanguageNames } from './types';

export type State = {
	localizedLanguageNames: { [ i18nLocale: string ]: LocalizedLanguageNames };
};

const DEFAULT_STATE: State = { localizedLanguageNames: {} };

const reducer = ( state = DEFAULT_STATE, action: I18nAction ): State => {
	switch ( action.type ) {
		case 'SET_LOCALIZED_LANGUAGE_NAMES':
			return {
				...state,
				localizedLanguageNames: {
					...state.localizedLanguageNames,
					[ action.i18nLocale ]: action.localizedLanguageNames,
				},
			};
		default:
			return state;
	}
};

export default reducer;
