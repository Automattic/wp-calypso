import {
	fetchAgencyMigrationCommissionSites,
	requestMigrationReverification,
	tagAgencySitesForCommission,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type { RequestReverificationInput, TagSitesForCommissionInput } from '@automattic/api-core';

export const agencyMigrationCommissionSitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'migration-commission-sites' ],
		queryFn: () => fetchAgencyMigrationCommissionSites( agencyId ),
		enabled: !! agencyId,
	} );

// The mutation builders below intentionally omit `onSuccess` cache invalidation.
// The classic A8C for Agencies app provides Calypso's own QueryClient rather
// than the `@automattic/api-queries` singleton, so invalidation must run against
// the in-context client — callers invalidate
// `agencyMigrationCommissionSitesQuery( agencyId ).queryKey` via `useQueryClient()`.

export const tagAgencySitesForCommissionMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationFn: ( input: TagSitesForCommissionInput ) =>
			tagAgencySitesForCommission( agencyId, input ),
	} );

export const requestMigrationReverificationMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationFn: ( input: RequestReverificationInput ) =>
			requestMigrationReverification( agencyId, input ),
	} );
