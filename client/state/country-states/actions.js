/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
} from 'state/action-types';

export function receiveStatesList( country, statesList ) {
	return {
		type: COUNTRY_STATES_RECEIVE,
		country,
		statesList: statesList
	};
}

export function requestStatesList( country ) {
	return ( dispatch ) => {
		dispatch( { type: COUNTRY_STATES_REQUEST, country } );

		return wpcom.undocumented().getDomainRegistrationSupportedStates( country )
			.then( response => dispatch( receiveStatesList( country, response ) ) )
			.catch( error => dispatch( {
				type: COUNTRY_STATES_REQUEST_FAILURE,
				error
			} ) );
	};
}
