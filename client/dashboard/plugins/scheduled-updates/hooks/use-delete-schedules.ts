import { deleteSiteUpdateSchedule, type Site } from '@automattic/api-core';
import { queryClient, siteUpdateSchedulesQuery } from '@automattic/api-queries';
import { useCallback } from '@wordpress/element';
import { useAnalytics } from '../../../app/analytics';
import { normalizeScheduleId } from '../helpers';
import { useEligibleSites } from './use-eligible-sites';

/**
 * Batch delete an existing schedule across multiple sites and track analytics.
 * @param {number[]} siteIds Sites to delete from
 * @param {string} scheduleId Base schedule ID to delete
 */
export function useDeleteSchedules( siteIds: number[], scheduleId: string ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: eligibleSites = [] } = useEligibleSites();
	const normalizedId = normalizeScheduleId( scheduleId );
	const mutateAsync = useCallback( async () => {
		const errors: string[] = [];
		const siteMap = new Map( ( eligibleSites as Site[] ).map( ( s ) => [ s.ID, s ] ) );

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
			throw new Error( errors.join( '\n' ) );
		}
	}, [ siteIds, normalizedId, eligibleSites, recordTracksEvent ] );

	return { mutateAsync } as const;
}
