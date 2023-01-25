let reduxStore = null;

export function setReduxStore( store ) {
	reduxStore = store;
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
