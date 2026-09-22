import {
	createAgencySite,
	fetchAgencyMigrationCommissionSites,
	fetchAgencyPendingSites,
	fetchAgencySitesWithPlugins,
	provisionAgencyDevSite,
	provisionAgencySite,
	validateAgencySiteAddress,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { invalidateAgencyLicenses } from './jetpack-agency-licenses';
import { queryClient } from './query-client';
import type { ProvisionAgencyDevSiteParams, ProvisionAgencySiteParams } from '@automattic/api-core';

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
		// Not persisted: checkout and provisioning both change this server-side.
		meta: { persist: false },
	} );

export interface ImportAgencySitesResult {
	imported: number[];
	failed: number[];
}

/**
 * Brings the selected sites under the agency's management, one request each.
 *
 * A partial failure resolves rather than rejects, so callers can report what
 * did land; only a run where nothing succeeded is an error.
 */
export const agencySitesImportMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-sites-import' },
		mutationFn: async ( blogIds: number[] ): Promise< ImportAgencySitesResult > => {
			const results = await Promise.allSettled(
				blogIds.map( ( blogId ) => createAgencySite( agencyId, blogId ) )
			);

			const imported: number[] = [];
			const failed: number[] = [];

			results.forEach( ( result, index ) => {
				const succeeded = result.status === 'fulfilled' && result.value?.success !== false;
				( succeeded ? imported : failed ).push( blogIds[ index ] );
			} );

			if ( ! imported.length ) {
				const rejection = results.find( ( result ) => result.status === 'rejected' );
				throw rejection ? rejection.reason : new Error( 'No sites could be added.' );
			}

			return { imported, failed };
		},
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
			queryClient.invalidateQueries( { queryKey: agencyPendingSitesQuery( agencyId ).queryKey } ),
	} );

/**
 * Creates a free development site. It consumes one of the agency's dev
 * licenses, so the license queries are invalidated: the remaining allowance
 * gates both create-site CTAs, and the new license belongs in Purchases.
 */
export const provisionAgencyDevSiteMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-dev-site-provision' },
		mutationFn: ( params: ProvisionAgencyDevSiteParams ) =>
			provisionAgencyDevSite( agencyId, params ),
		onSuccess: () => {
			invalidateAgencyLicenses( agencyId );
			queryClient.invalidateQueries( { queryKey: agencyPendingSitesQuery( agencyId ).queryKey } );
		},
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
