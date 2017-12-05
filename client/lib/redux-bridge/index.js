/** @format */
let reduxStore = null;

export function setReduxStore( store ) {
	reduxStore = store;
}

/**
 * Get the state of the current redux store
 * @returns {Object} Redux state
 */
export function reduxGetState() {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.getState();
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
