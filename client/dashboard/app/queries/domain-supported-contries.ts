import { queryOptions } from '@tanstack/react-query';
import { fetchCountryList, fetchStatesList } from '../../data/domain-supported-countries';

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
