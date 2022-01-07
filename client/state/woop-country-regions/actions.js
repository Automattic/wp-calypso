// import wpcom from 'calypso/lib/wp';
import {
	WOOP_COUNTRY_REGIONS_RECEIVE,
	WOOP_COUNTRY_REGIONS_REQUEST,
	// WOOP_COUNTRY_REGIONS_REQUEST_FAILURE,
	// WOOP_COUNTRY_REGIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

import 'calypso/state/country-states/init';

export function receiveCountryRegions( countryRegions, countryCode ) {
	countryCode = countryCode.toLowerCase();

	return {
		type: WOOP_COUNTRY_REGIONS_RECEIVE,
		countryCode,
		countryRegions,
	};
}

export function requestCountryRegions( countryCode ) {
	countryCode = countryCode.toLowerCase();

	return ( dispatch ) => {
		dispatch( {
			type: WOOP_COUNTRY_REGIONS_REQUEST,
			countryCode,
		} );

		return [
			{ name: 'California', code: 'CA' },
			{ name: 'Florida', code: 'FL' },
			{ name: 'New York', code: 'NY' },
			{ name: 'Texas', code: 'TX' },
		];
		/*
		return wpcom.req
			.get( `/domains/supported-states/${ countryCode }` )
			.then( ( countryRegions ) => {
				dispatch( receiveCountryRegions( countryRegions, countryCode ) );
				dispatch( {
					type: WOOP_COUNTRY_REGIONS_REQUEST_SUCCESS,
					countryCode,
				} );
			} )
			.catch( ( error ) =>
				dispatch( {
					type: WOOP_COUNTRY_REGIONS_REQUEST_FAILURE,
					countryCode,
					error,
				} )
			);
*/
	};
}
