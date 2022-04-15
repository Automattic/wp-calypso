import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const getProductsList = ( state: State ) => {
	return state.productsList;
};

export const getProductBySlug = ( state: State, slug: string ) => {
	return state.productsList && state.productsList[ slug ];
};
