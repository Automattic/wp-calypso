/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
	COUNTRY_STATES_REQUEST_SUCCESS,
} from 'state/action-types';

export function receiveCountryStates( countryStates, countryCode ) {
	countryCode = countryCode.toLowerCase();

	return {
		type: COUNTRY_STATES_RECEIVE,
		countryCode,
		countryStates,
	};
}

export function requestCountryStates( countryCode ) {
	countryCode = countryCode.toLowerCase();

	return ( dispatch ) => {
		dispatch( {
			type: COUNTRY_STATES_REQUEST,
			countryCode,
		} );

		return wpcom
			.undocumented()
			.getDomainRegistrationSupportedStates( countryCode )
			.then( ( countryStates ) => {
				dispatch( receiveCountryStates( countryStates, countryCode ) );
				dispatch( {
					type: COUNTRY_STATES_REQUEST_SUCCESS,
					countryCode,
				} );
			} )
			.catch( ( error ) =>
				dispatch( {
					type: COUNTRY_STATES_REQUEST_FAILURE,
					countryCode,
					error,
				} )
			);
	};
}
