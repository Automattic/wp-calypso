/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	STATES_LIST_RECEIVE,
	STATES_LIST_REQUEST,
	STATES_LIST_REQUEST_FAILURE,
} from 'state/action-types';

export function receiveStatesList( statesList, countryCode ) {
	return {
		type: STATES_LIST_RECEIVE,
		countryCode,
		statesList,
	};
}

export function requestStatesList( countryCode ) {
	return ( dispatch ) => {
		dispatch( {
			type: STATES_LIST_REQUEST,
			countryCode
		} );

		return wpcom.undocumented().getDomainRegistrationSupportedStates( countryCode )
			.then( statesList => dispatch( receiveStatesList( statesList, countryCode ) ) )
			.catch( error => dispatch( {
				type: STATES_LIST_REQUEST_FAILURE,
				error
			} ) );
	};
}
