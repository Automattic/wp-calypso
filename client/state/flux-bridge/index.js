/** @format */

let currentStore = null;

export const fluxBridgeEnhancer = next => ( reducer, initialState ) => {
	currentStore = next( reducer, initialState );
	return currentStore;
};

export const reduxDispatch = () => {
	return currentStore && currentStore.dispatch;
};
