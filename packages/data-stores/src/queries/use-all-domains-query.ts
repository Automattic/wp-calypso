import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest from 'wpcom-proxy-request';
import type { DomainData } from './use-site-domains-query';

// The data returned by the /all-domains endpoint only includes the basic data
// related to a domain.
export type PartialDomainData = Pick<
	DomainData,
	| 'auto_renewing'
	| 'blog_id'
	| 'current_user_can_add_email'
	| 'current_user_is_owner'
	| 'domain'
	| 'email_forwards_count'
	| 'expiry'
	| 'google_apps_subscription'
	| 'has_registration'
	| 'is_wpcom_staging_domain'
	| 'is_hundred_year_domain'
	| 'registration_date'
	| 'titan_mail_subscription'
	| 'tld_maintenance_end_time'
	| 'type'
	| 'wpcom_domain'
	| 'domain_status'
>;

export interface AllDomainsQueryFnData {
	domains: PartialDomainData[];
}

export interface AllDomainsQueryArgs {
	no_wpcom?: boolean;
	resolve_status?: boolean;
}

export const getAllDomainsQueryKey = ( queryArgs: AllDomainsQueryArgs = {} ) => [
	'all-domains',
	queryArgs,
];

export function useAllDomainsQuery< TError = unknown, TData = AllDomainsQueryFnData >(
	queryArgs: AllDomainsQueryArgs = {},
	options: Omit< UseQueryOptions< AllDomainsQueryFnData, TError, TData >, 'queryKey' > = {}
) {
	return useQuery< AllDomainsQueryFnData, TError, TData >( {
		queryKey: getAllDomainsQueryKey( queryArgs ),
		queryFn: () =>
			wpcomRequest< AllDomainsQueryFnData >( {
				path: addQueryArgs( '/all-domains', queryArgs ),
				apiVersion: '1.1',
			} ),

		// It's reasonable to assume that users won't register a domain in another tab
		// and then expect the list to update automatically when they switch back.
		// We expect users to refresh the page after making substantial domain changes.
		refetchOnWindowFocus: false,

		...options,
	} );
}
