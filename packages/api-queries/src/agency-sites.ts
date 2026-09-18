import {
	fetchAgencyMigrationCommissionSites,
	fetchAgencySitesWithPlugins,
	fetchPendingAgencySites,
	provisionAgencySite,
	validateAgencySiteAddress,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
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
 * Sites the agency has purchased but not yet provisioned, which is how a
 * hosting license is matched to the site it will create.
 */
export const pendingAgencySitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'sites', 'pending' ] as const,
		queryFn: () => fetchPendingAgencySites( agencyId ),
		// Not persisted: checkout and provisioning both change this server-side.
		meta: { persist: false },
	} );

/**
 * Every site the agency has. Backs the readiness check behind the provisioning
 * notice, which polls it while a site is being created.
 */
export const provisionedAgencySitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'sites', 'provisioned' ] as const,
		queryFn: () => fetchAgencyMigrationCommissionSites( agencyId ),
		// Not persisted: it is polled while a site is created, and the full site
		// list is too large to rewrite to storage on every poll.
		meta: { persist: false },
	} );

export const provisionAgencySiteMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-site-provision' },
		mutationFn: ( params: ProvisionAgencySiteParams ) => provisionAgencySite( agencyId, params ),
		onSuccess: () =>
			queryClient.invalidateQueries( { queryKey: pendingAgencySitesQuery( agencyId ).queryKey } ),
	} );

/**
 * Whether the agency can claim `{siteName}.wordpress.com`, keyed by name so each
 * address gets its own entry.
 *
 * Not persisted: an address is only free until someone else takes it, so a
 * verdict read back from storage says nothing about now.
 */
export const agencySiteAddressValidationQuery = ( agencyId: number, siteName: string ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'validate-site-address', siteName ] as const,
		queryFn: () => validateAgencySiteAddress( agencyId, siteName ),
		meta: { persist: false },
	} );
