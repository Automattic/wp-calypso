import { deleteSiteUpdateSchedule, type Site } from '@automattic/api-core';
import {
	queryClient,
	siteUpdateSchedulesQuery,
	hostingUpdateSchedulesQuery,
} from '@automattic/api-queries';
import { useCallback } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { normalizeScheduleId } from '../helpers';
import { useEligibleSites } from './use-eligible-sites';

type UseDeleteSchedulesOptions = {
	/**
	 * Whether to apply optimistic updates to the hosting aggregate cache.
	 */
	optimistic?: boolean;
};

/**
 * Batch delete an existing schedule across multiple sites and track analytics.
 * @param {number[]} siteIds Sites to delete from
 * @param {string} scheduleId Base schedule ID to delete
 */
export function useDeleteSchedules(
	siteIds: number[],
	scheduleId: string,
	options?: UseDeleteSchedulesOptions
) {
	const { recordTracksEvent } = useAnalytics();
	const { data: eligibleSites = [] } = useEligibleSites();
	const normalizedId = normalizeScheduleId( scheduleId );
	const mutateAsync = useCallback( async () => {
		const errors: string[] = [];
		const siteMap = new Map( ( eligibleSites as Site[] ).map( ( s ) => [ s.ID, s ] ) );
		let rollbackHosting: ( () => void ) | undefined;

		// Apply optional optimistic update to hosting aggregate cache
		if ( options?.optimistic && siteIds.length && normalizedId ) {
			const hostingQuery = hostingUpdateSchedulesQuery();
			const prevData = queryClient.getQueryData( hostingQuery.queryKey );
			if ( prevData && typeof prevData === 'object' && 'sites' in prevData ) {
				const cloned = JSON.parse( JSON.stringify( prevData ) );
				siteIds.forEach( ( id ) => {
					const key = String( id );
					if ( cloned.sites?.[ key ]?.[ normalizedId ] ) {
						delete cloned.sites[ key ][ normalizedId ];
					}
				} );
				queryClient.setQueryData( hostingQuery.queryKey, cloned );
				rollbackHosting = () => {
					queryClient.setQueryData( hostingQuery.queryKey, prevData );
				};
			}
		}

		await Promise.all(
			siteIds.map( async ( siteId ) => {
				try {
					await deleteSiteUpdateSchedule( siteId, normalizedId );
					await queryClient.invalidateQueries( siteUpdateSchedulesQuery( siteId ) );
					const site = siteMap.get( siteId );
					if ( site ) {
						recordTracksEvent( 'calypso_scheduled_updates_delete_schedule', {
							site_slug: site.slug,
						} );
					}
				} catch ( e ) {
					errors.push( `Delete failed for site ${ siteId }` );
				}
			} )
		);

		if ( errors.length ) {
			// Rollback optimistic changes on error
			try {
				rollbackHosting?.();
			} catch {
				// no-op
			}
			throw new Error( errors.join( '\n' ) );
		}

		// Invalidate hosting aggregate to refresh list view
		await queryClient.invalidateQueries( hostingUpdateSchedulesQuery() );
	}, [ eligibleSites, recordTracksEvent, siteIds, normalizedId, options ] );

	return { mutateAsync } as const;
}
