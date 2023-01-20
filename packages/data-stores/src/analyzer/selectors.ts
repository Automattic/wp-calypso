import type { State } from './reducers';

export const getState = ( state: State ) => state;
export const isSiteColorsInAnalysis = ( state: State ) => state.analyzer.analyzing;
export const getSiteColors = ( state: State, url: null | string ) => {
	if ( ! url ) {
		return null;
	}

	return state.analyzer.colors?.[ url ];
};
