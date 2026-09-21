import {
	createAgencySite,
	fetchAgencyPendingSites,
	fetchAgencySitesWithPlugins,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';

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
