let reduxStore = null;

export function setReduxStore( store ) {
	reduxStore = store;
}

/**
 * Get the state of the current redux store
 *
 * @returns {object} Redux state
 */
export function reduxGetState() {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.getState();
}

/**
 * Dispatch an action against the current redux store
 *
 * @returns {any} Result of the dispatch
 */
export function reduxDispatch( ...args ) {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.dispatch( ...args );
}
