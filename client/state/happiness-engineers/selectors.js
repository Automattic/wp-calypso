/**
 * Internal dependencies
 */
import 'calypso/state/happiness-engineers/init';

/**
 * Returns happiness engineers
 *
 *
 * @param {{}} state currents state
 * @returns {Array} happiness engineers
 */
export function getHappinessEngineers( state ) {
	return state.happinessEngineers.items;
}

/**
 * Returns whether we have loaded some data. Always false when fetching data
 *
 * @param {{}} state currents state
 * @returns {boolean} Whether we loaded some data or not
 */
export function isRequestingHappinessEngineers( state ) {
	return state.happinessEngineers.requesting;
}

/**
 * Check if we have happiness engineers loaded
 *
 * @param {{}} state currents state
 * @returns {boolean} true if loaded, false otherwise
 */
export function hasReceivedHappinessEngineers( state ) {
	return state.happinessEngineers.items !== null;
}
