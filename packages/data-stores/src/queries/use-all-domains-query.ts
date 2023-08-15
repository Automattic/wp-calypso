import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

// The data returned by the /all-domains endpoint only includes the basic data
// related to a domain.
export interface PartialDomainData {
	domain: string;
	blog_id: number;
	type: 'mapping' | 'wpcom';
	is_wpcom_staging_domain: boolean;
	has_registration: boolean;
	registration_date: string;
	expiry: string;
	wpcom_domain: boolean;
	current_user_is_owner: boolean;
}

export interface AllDomainsQueryFnData {
	domains: PartialDomainData[];
}

export function useAllDomainsQuery( options: UseQueryOptions< AllDomainsQueryFnData > = {} ) {
	return useQuery( {
		queryKey: [ 'all-domains' ],
		queryFn: () =>
			wpcomRequest< AllDomainsQueryFnData >( { path: '/all-domains', apiVersion: '1.1' } ),
		...options,
	} );
}
