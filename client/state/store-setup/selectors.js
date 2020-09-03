/**
 * Internal dependencies
 */
import 'state/store-setup/init';

/**
 * Returns store setup data
 *
 *
 * @param {{}} state currents state
 * @returns {Object} store setup data
 */
export function getStoreSetupData( state ) {
	return state.storeSetup.data;
}

/**
 * Returns whether we have loaded some data. Always false when fetching data
 *
 * @param {{}} state currents state
 * @returns {boolean} Whether we loaded some data or not
 */
export function isRequestingStoreSetupData( state ) {
	return state.storeSetup.requesting;
}
