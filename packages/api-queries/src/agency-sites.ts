import { fetchAgencyPendingSites, fetchAgencySitesWithPlugins } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

// Backs the agency-scoped `/agency/{id}/sites` endpoint, narrowed to sites with
// the given plugins installed. For the general managed-sites list (with paging
// and total count) use `jetpack-agency-sites` (`/jetpack-agency/sites`) instead.
export const agencySitesWithPluginsQuery = ( agencyId: number, plugins: string[] ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'sites-with-plugins', plugins ],
		queryFn: () => fetchAgencySitesWithPlugins( agencyId, plugins ),
	} );

// Sites the agency has paid for but not yet set up.
export const agencyPendingSitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'sites', 'pending' ] as const,
		queryFn: () => fetchAgencyPendingSites( agencyId ),
	} );
