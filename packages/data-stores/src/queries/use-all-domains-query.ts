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
	| 'current_user_can_add_email'
	| 'google_apps_subscription'
	| 'titan_mail_subscription'
	| 'email_forwards_count'
	| 'tld_maintenance_end_time'
>;

export interface AllDomainsQueryFnData {
	domains: PartialDomainData[];
}

export interface AllDomainsQueryArgs {
	no_wpcom?: boolean;
}

export function useAllDomainsQuery< TError = unknown, TData = AllDomainsQueryFnData >(
	queryArgs: AllDomainsQueryArgs = {},
	options: UseQueryOptions< AllDomainsQueryFnData, TError, TData > = {}
) {
	return useQuery( {
		queryKey: [ 'all-domains', queryArgs ],
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
