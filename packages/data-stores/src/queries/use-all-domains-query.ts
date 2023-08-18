import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { DomainData } from './use-site-domains-query';

// The data returned by the /all-domains endpoint only includes the basic data
// related to a domain.
export type PartialDomainData = Pick<
	DomainData,
	| 'domain'
	| 'blog_id'
	| 'type'
	| 'is_wpcom_staging_domain'
	| 'has_registration'
	| 'registration_date'
	| 'expiry'
	| 'wpcom_domain'
	| 'current_user_is_owner'
>;

export interface AllDomainsQueryFnData {
	domains: PartialDomainData[];
}

export function useAllDomainsQuery( options: UseQueryOptions< AllDomainsQueryFnData > = {} ) {
	return useQuery( {
		queryKey: [ 'all-domains' ],
		queryFn: () =>
			wpcomRequest< AllDomainsQueryFnData >( {
				path: '/all-domains?test_data=true&domain_count=2',
				apiVersion: '1.1',
			} ),
		...options,
	} );
}
