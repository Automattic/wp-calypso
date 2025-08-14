import { queryOptions } from '@tanstack/react-query';
import { fetchDomain, fetchCountryList } from '../../data/domain';

export const domainQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName ],
		queryFn: () => fetchDomain( domainName ),
	} );

export const countryListQuery = () =>
	queryOptions( {
		queryKey: [ 'supported-countries' ],
		queryFn: () => fetchCountryList(),
	} );
