/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	COUNTRY_STATES_RECEIVE,
	COUNTRY_STATES_REQUEST,
	COUNTRY_STATES_REQUEST_FAILURE,
} from 'state/action-types';

export function receiveCountryStates( countryStates, countryCode ) {
	return {
		type: COUNTRY_STATES_RECEIVE,
		countryCode,
		countryStates,
	};
}

export function requestCountryStates( countryCode ) {
	return ( dispatch ) => {
		dispatch( {
			type: COUNTRY_STATES_REQUEST,
			countryCode
		} );

		return wpcom.undocumented().getDomainRegistrationSupportedStates( countryCode )
			.then( ( countryStates ) => dispatch( receiveCountryStates( countryStates, countryCode ) ) )
			.catch( ( error ) => dispatch( {
				type: COUNTRY_STATES_REQUEST_FAILURE,
				error
			} ) );
	};
}
