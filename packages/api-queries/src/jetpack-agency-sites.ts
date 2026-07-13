import { fetchAgencySites } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import { agencyQuery } from './agency';
import { queryClient } from './query-client';
import type { FetchAgencySitesOptions } from '@automattic/api-core';

export const agencySitesQueryKey = [ 'agency-sites' ];

async function resolveAgencyId(): Promise< number > {
	const agency = await queryClient.ensureQueryData( agencyQuery() );
	if ( ! agency.id ) {
		throw new Error( 'No active agency found for the current user.' );
	}
	return agency.id;
}

export const paginatedAgencySitesQuery = ( options: FetchAgencySitesOptions = {} ) =>
	queryOptions( {
		queryKey: [ ...agencySitesQueryKey, 'paginated', options ],
		queryFn: async () => fetchAgencySites( await resolveAgencyId(), options ),
	} );

export const agencySitesQuery = ( options: FetchAgencySitesOptions = {} ) =>
	queryOptions( {
		queryKey: [ ...agencySitesQueryKey, options ],
		queryFn: async () => ( await fetchAgencySites( await resolveAgencyId(), options ) ).sites,
	} );

// The endpoint has no single-site lookup, so we search the agency's sites by
// URL and select the exact match. TODO: replace with a dedicated single-site
// endpoint.
export const agencySiteQuery = ( siteUrl: string ) =>
	queryOptions( {
		queryKey: [ ...agencySitesQueryKey, 'site', siteUrl ],
		queryFn: async () => {
			const { sites } = await fetchAgencySites( await resolveAgencyId(), {
				search: siteUrl,
				per_page: 100,
			} );
			return sites.find( ( site ) => site.url === siteUrl ) ?? null;
		},
	} );
