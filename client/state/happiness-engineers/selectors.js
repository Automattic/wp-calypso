/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

function getHappinessEngineersState( state ) {
	return state.happinessengineers;
}

function createHappinessEngineersSelector( fn ) {
	return createSelector( fn, ( state ) => [ getHappinessEngineersState( state ) ] );
}

/**
 * Returns happiness engineers
 * @returns {[]} happiness engineers
 */
export const getHappinessEngineers = createHappinessEngineersSelector(
	( state ) => getHappinessEngineersState( state ).items
);

/**
 * Returns whether we have loaded some data. Always false when fetching data
 * @param {{}} state - Previous state
 * @returns {boolean} - Whether we loaded some data or not
 */
export function isRequesting( state ) {
	return getHappinessEngineersState( state ).requesting;
}
