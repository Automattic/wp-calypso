import {
	fetchAgencySitesWithPlugins,
	fetchPendingAgencySites,
	fetchProvisionedAgencySites,
	provisionAgencySite,
	validateAgencySiteAddress,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import type { ProvisionAgencySiteParams } from '@automattic/api-core';

// Backs the agency-scoped `/agency/{id}/sites` endpoint, narrowed to sites with
// the given plugins installed. For the general managed-sites list (with paging
// and total count) use `jetpack-agency-sites` (`/jetpack-agency/sites`) instead.
export const agencySitesWithPluginsQuery = ( agencyId: number, plugins: string[] ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'sites-with-plugins', plugins ],
		queryFn: () => fetchAgencySitesWithPlugins( agencyId, plugins ),
	} );

/**
 * Sites the agency has purchased but not yet provisioned, backing the
 * "Needs setup" screen and the pending-site counts in the sites menu.
 */
export const pendingAgencySitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'sites', 'pending' ] as const,
		queryFn: () => fetchPendingAgencySites( agencyId ),
	} );

/**
 * Every site the agency has. Backs the readiness check behind the provisioning
 * notice, which polls it while a site is being created.
 */
export const provisionedAgencySitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'sites', 'provisioned' ] as const,
		queryFn: () => fetchProvisionedAgencySites( agencyId ),
	} );

// A4A runs on Calypso's QueryClient rather than the `api-queries` singleton, so
// callers invalidate `pendingAgencySitesQuery` themselves via `useQueryClient()`.
export const provisionAgencySiteMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-site-provision' },
		mutationFn: ( params: ProvisionAgencySiteParams ) => provisionAgencySite( agencyId, params ),
	} );

/**
 * Whether the agency can claim `{siteName}.wordpress.com`. Keyed by name so a
 * form that returns to an address it already checked does not ask again.
 */
export const agencySiteAddressValidationQuery = ( agencyId: number, siteName: string ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'validate-site-address', siteName ] as const,
		queryFn: () => validateAgencySiteAddress( agencyId, siteName ),
	} );
