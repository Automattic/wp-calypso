import {
	editSiteUpdateSchedule,
	type EditSiteUpdateScheduleBody,
	type Site,
} from '@automattic/api-core';
import { queryClient, siteUpdateSchedulesQuery } from '@automattic/api-queries';
import { useCallback } from '@wordpress/element';
import { useAnalytics } from '../../../app/analytics';
import { normalizeScheduleId, prepareTimestamp } from '../helpers';
import { useEligibleSites } from './use-eligible-sites';
import type { Frequency, Weekday } from '../types';

export type EditBatchInputs = {
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string;
};

/**
 * Batch edit an existing schedule across multiple sites and track analytics.
 * @param {number[]} siteIds Sites to edit
 * @param {string} scheduleId Base schedule ID to edit
 */
export function useEditSchedules( siteIds: number[], scheduleId: string ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: eligibleSites = [] } = useEligibleSites();
	const normalizedId = normalizeScheduleId( scheduleId );

	const mutateAsync = useCallback(
		async ( { plugins, frequency, weekday, time }: EditBatchInputs ) => {
			const timestamp = prepareTimestamp( frequency, weekday, time );
			const body: EditSiteUpdateScheduleBody = {
				plugins,
				schedule: { interval: frequency, timestamp },
				health_check_paths: [],
			};

			const errors: string[] = [];
			const siteMap = new Map( ( eligibleSites as Site[] ).map( ( s ) => [ s.ID, s ] ) );
			const eventDate = new Date( timestamp * 1000 );
			const hours = eventDate.getHours();
			const weekdayIndex = frequency === 'weekly' ? eventDate.getDay() : undefined;

			await Promise.all(
				siteIds.map( async ( siteId ) => {
					try {
						await editSiteUpdateSchedule( siteId, normalizedId, body );
						await queryClient.invalidateQueries( siteUpdateSchedulesQuery( siteId ) );
						const site = siteMap.get( siteId );
						if ( site ) {
							recordTracksEvent( 'calypso_scheduled_updates_edit_schedule', {
								site_slug: site.slug,
								frequency,
								plugins_number: plugins.length,
								hours,
								weekday: weekdayIndex,
							} );
						}
					} catch ( e ) {
						errors.push( `Edit failed for site ${ siteId }` );
					}
				} )
			);

			if ( errors.length ) {
				throw new Error( errors.join( '\n' ) );
			}
		},
		[ siteIds, normalizedId, eligibleSites, recordTracksEvent ]
	);

	return { mutateAsync } as const;
}
