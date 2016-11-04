/**
 * Returns happiness engineers
 * @param {{}} state - Previous state
 * @returns {Array} happiness engineers
 */
export function getHappinessEngineers( state ) {
	return state.happinessEngineers.items;
}

/**
 * Returns whether we have loaded some data. Always false when fetching data
 * @param {{}} state - Previous state
 * @returns {boolean} - Whether we loaded some data or not
 */
export function isRequestingHappinessEngineers( state ) {
	return state.happinessEngineers.requesting;
}
