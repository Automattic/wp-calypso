/** @format */
let reduxStore = null;

export function setReduxStore( store ) {
	reduxStore = store;
}

/**
 * Dispatch an action against the current redux store
 */
export function reduxDispatch( ...args ) {
	if ( ! reduxStore ) {
		return;
	}
	reduxStore.dispatch( ...args );
}

export function getState() {
	if ( reduxStore ) {
		return reduxStore.getState();
	}
	return undefined;
}
