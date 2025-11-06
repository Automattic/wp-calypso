let reduxStore = null;

export function setReduxStore( store ) {
	reduxStore = store;
}

/**
 * Get the current Redux store instance
 * @returns {Object|null} The Redux store instance, or null if not set
 */
export function getReduxStore() {
	return reduxStore;
}

/**
 * Dispatch an action against the current redux store
 * @returns {undefined} Result of the dispatch
 */
export function reduxDispatch( ...args ) {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.dispatch( ...args );
}
