import { fetchCountryList, fetchStatesList } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const countryListQuery = () =>
	queryOptions( {
		queryKey: [ 'supported-countries' ],
		queryFn: () => fetchCountryList(),
	} );

export const statesListQuery = ( countryCode: string ) =>
	queryOptions( {
		queryKey: [ 'supported-states', countryCode ],
		queryFn: () => fetchStatesList( countryCode ),
	} );
