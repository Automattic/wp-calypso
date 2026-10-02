import { fetchAgencySites } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import { agencyQuery } from './agency';
import { queryClient } from './query-client';
import { siteBySlugQuery } from './site';
import type { AgencySite, FetchAgencySitesOptions } from '@automattic/api-core';

export const agencySitesQueryKey = [ 'agency-sites' ];

async function resolveAgencyId(): Promise< number > {
	const agency = await queryClient.ensureQueryData( agencyQuery() );
	if ( ! agency.id ) {
		throw new Error( 'No active agency found for the current user.' );
	}
	return agency.id;
}

// Pass an explicit `agencyId` (e.g. from Redux in the classic A4A app) to skip
// the async agency resolution; otherwise the active agency is resolved for you.
// The full response (including `total`) is returned so callers can paginate.
export const paginatedAgencySitesQuery = (
	options: FetchAgencySitesOptions = {},
	agencyId?: number
) =>
	queryOptions( {
		queryKey: [ ...agencySitesQueryKey, 'paginated', agencyId ?? null, options ],
		queryFn: async () => fetchAgencySites( agencyId ?? ( await resolveAgencyId() ), options ),
	} );

export const agencySitesQuery = ( options: FetchAgencySitesOptions = {} ) =>
	queryOptions( {
		queryKey: [ ...agencySitesQueryKey, options ],
		queryFn: async () => ( await fetchAgencySites( await resolveAgencyId(), options ) ).sites,
	} );

// The index may store either the `.wordpress.com` or `.wpcomstaging.com` URL,
// so search by subdomain and match by blog ID. TODO: replace with a dedicated
// single-site endpoint.
export const agencySiteQuery = ( siteUrl: string ) =>
	queryOptions( {
		queryKey: [ ...agencySitesQueryKey, 'site', siteUrl ],
		queryFn: async () => {
			const [ agencyId, site ] = await Promise.all( [
				resolveAgencyId(),
				queryClient.ensureQueryData( siteBySlugQuery( siteUrl ) ),
			] );
			const findSite = ( sites: AgencySite[] ) =>
				sites.find( ( agencySite ) => agencySite.blog_id === site.ID ) ?? null;

			const { sites: searchResults } = await fetchAgencySites( agencyId, {
				search: siteUrl.split( '.' )[ 0 ],
				per_page: 100,
			} );
			const match = findSite( searchResults );
			if ( match ) {
				return match;
			}

			const { total } = await fetchAgencySites( agencyId, { per_page: 1 } );
			if ( ! total ) {
				return null;
			}

			const { sites } = await fetchAgencySites( agencyId, { per_page: total } );
			return findSite( sites );
		},
	} );

// The blog IDs the agency already manages, so the import picker can leave them
// out. The endpoint has no "all" mode, so the count comes first and sizes the
// second request.
export const agencyManagedSiteIdsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ ...agencySitesQueryKey, 'managed-ids', agencyId ] as const,
		queryFn: async (): Promise< number[] > => {
			const { total } = await fetchAgencySites( agencyId, { per_page: 1 } );

			if ( ! total ) {
				return [];
			}

			const { sites } = await fetchAgencySites( agencyId, { per_page: total } );
			return sites.map( ( site ) => site.blog_id );
		},
	} );
