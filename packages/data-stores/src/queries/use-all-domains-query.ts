import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
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

export interface AllDomainsQueryParams {
	sortKey?: 'domain' | 'site' | 'status' | 'registered-until';
	sortOrder?: 'asc' | 'desc';
}

export interface AllDomainsQueryFnData {
	domains: PartialDomainData[];
}

export function useAllDomainsQuery(
	{ sortKey, sortOrder }: AllDomainsQueryParams = {},
	options: UseQueryOptions< AllDomainsQueryFnData > = {}
) {
	return useQuery( {
		queryKey: [ 'all-domains', sortKey, sortOrder ],
		queryFn: () =>
			wpcomRequest< AllDomainsQueryFnData >( {
				path: addQueryArgs( '/all-domains', {
					sort_key: sortKey,
					sort_order: sortOrder,
				} ),
				apiVersion: '1.1',
			} ),
		...options,
	} );
}
