import {
	fetchAgencyMigrationCommissionSites,
	requestMigrationReverification,
	tagAgencySitesForCommission,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type { RequestReverificationInput, TagSitesForCommissionInput } from '@automattic/api-core';

export const agencyMigrationCommissionSitesQuery = ( agencyId: number | undefined ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'migration-commission-sites' ],
		queryFn: () => fetchAgencyMigrationCommissionSites( agencyId as number ),
		enabled: !! agencyId,
	} );

// The mutation builders below intentionally omit `onSuccess` cache invalidation.
// The classic A8C for Agencies app provides Calypso's own QueryClient rather
// than the `@automattic/api-queries` singleton, so invalidation must run against
// the in-context client — callers invalidate
// `agencyMigrationCommissionSitesQuery( agencyId ).queryKey` via `useQueryClient()`.

export const tagAgencySitesForCommissionMutation = ( agencyId: number | undefined ) =>
	mutationOptions( {
		meta: { statId: 'agcy-mig-commission-tag' },
		mutationFn: ( input: TagSitesForCommissionInput ) => {
			if ( ! agencyId ) {
				throw new Error( 'No active agency found for the current user.' );
			}
			return tagAgencySitesForCommission( agencyId, input );
		},
	} );

export const requestMigrationReverificationMutation = ( agencyId: number | undefined ) =>
	mutationOptions( {
		meta: { statId: 'agcy-mig-reverify-request' },
		mutationFn: ( input: RequestReverificationInput ) => {
			if ( ! agencyId ) {
				throw new Error( 'No active agency found for the current user.' );
			}
			return requestMigrationReverification( agencyId, input );
		},
	} );
