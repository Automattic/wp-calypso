import type { State } from './reducers';

export const getState = ( state: State ) => state;
export const getSiteColors = ( state: State, url: string ) => {
	return state.analyzer.colors?.[ url ];
};
