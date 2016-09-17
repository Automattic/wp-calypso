/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	HAPPINESS_ENGINEERS_FETCH,
	HAPPINESS_ENGINEERS_RECEIVE,
	HAPPINESS_ENGINEERS_FETCH_FAILURE,
	HAPPINESS_ENGINEERS_FETCH_SUCCESS
} from 'state/action-types';

/**
 * Returns an action object used in signalling that a list of HEs
 * has been received.
 *
 * @param  {Object[]} happinessEngineers Array of template objects
 * @return {Object}                      Action object
 */
export function receiveHappinessEngineers( happinessEngineers ) {
	return {
		type: HAPPINESS_ENGINEERS_RECEIVE,
		happinessEngineers: happinessEngineers
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch HEs.
 *
 * @return {Function} Action thunk
 */
export function fetchHappinessEngineers() {
	return ( dispatch ) => {
		dispatch( {
			type: HAPPINESS_ENGINEERS_FETCH
		} );

		return wpcom.undocumented().getHappinessEngineers().then( ( happinessEngineers ) => {
			dispatch( receiveHappinessEngineers( happinessEngineers ) );
			dispatch( {
				type: HAPPINESS_ENGINEERS_FETCH_SUCCESS
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: HAPPINESS_ENGINEERS_FETCH_FAILURE,
				error
			} );
		} );
	};
}
