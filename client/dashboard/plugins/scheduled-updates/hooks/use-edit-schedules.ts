import {
	createSiteUpdateSchedule,
	editSiteUpdateSchedule,
	deleteSiteUpdateSchedule,
	type CreateSiteUpdateScheduleBody,
	type EditSiteUpdateScheduleBody,
	type Site,
} from '@automattic/api-core';
import {
	queryClient,
	siteUpdateSchedulesQuery,
	hostingUpdateSchedulesQuery,
	siteJetpackMonitorSettingsCreateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from '@wordpress/element';
import { useAnalytics } from '../../../app/analytics';
import { CRON_CHECK_INTERVAL } from '../constants';
import { normalizeScheduleId, prepareTimestamp, runWithConcurrency } from '../helpers';
import { useEligibleSites } from './use-eligible-sites';
import type { Frequency, Weekday } from '../types';

type Inputs = {
	siteIds: string[]; // selected sites after user edits
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string; // HH:MM 24h
};

/**
 * Edits plugin update schedules across sites for a given schedule ID.
 *
 * Given the original participating sites, returns a `mutateAsync( inputs )` function that:
 * - Diffs sites into create/edit/delete sets based on the new selection
 * - Builds the schedule timestamp from `frequency`, `weekday`, and `time`
 * - Runs per-site API calls: POST (create), PUT (edit using normalized base schedule ID), DELETE (remove)
 * - Invalidates per-site schedule queries after each operation and the hosting aggregate after all
 * - Emits Tracks analytics for created/edited/deleted schedules and creates Jetpack Monitors for created sites
 *
 * Resolves when all operations complete; rejects if any operation fails.
 * @param {string} scheduleId The (possibly suffixed) schedule identifier from the route.
 * @param {string[]} originalSiteIds The sites currently participating in the schedule.
 * @returns {{ mutateAsync: ( inputs: Inputs ) => Promise< void > }} Hook API
 */
export function useEditSchedules( scheduleId: string, originalSiteIds: string[] ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: eligibleSites = [] } = useEligibleSites();
	const { mutateAsync: createMonitorForSite } = useMutation(
		siteJetpackMonitorSettingsCreateMutation()
	);

	const mutateAsync = useCallback(
		async ( { siteIds, plugins, frequency, weekday, time }: Inputs ) => {
			const timestamp = prepareTimestamp( frequency, weekday, time );
			const body: EditSiteUpdateScheduleBody & CreateSiteUpdateScheduleBody = {
				plugins,
				schedule: { interval: frequency, timestamp },
				health_check_paths: [],
			};

			const normalizedId = normalizeScheduleId( scheduleId );

			const selected = new Set( siteIds.map( Number ) );
			const original = new Set( originalSiteIds.map( Number ) );

			const toCreate: number[] = [];
			const toEdit: number[] = [];
			const toDelete: number[] = [];

			// Determine create and edit
			for ( const id of selected ) {
				if ( original.has( id ) ) {
					toEdit.push( id );
				} else {
					toCreate.push( id );
				}
			}

			// Determine delete
			for ( const id of original ) {
				if ( ! selected.has( id ) ) {
					toDelete.push( id );
				}
			}

			const errors: string[] = [];

			// Map sites for analytics and monitors
			const siteMap = new Map( ( eligibleSites as Site[] ).map( ( s ) => [ s.ID, s ] ) );
			const eventDate = new Date( timestamp * 1000 );
			const hours = eventDate.getHours();
			const weekdayIndex = frequency === 'weekly' ? eventDate.getDay() : undefined;

			// Run creates
			await Promise.all(
				toCreate.map( async ( siteId ) => {
					try {
						await createSiteUpdateSchedule( siteId, body );
						await queryClient.invalidateQueries( siteUpdateSchedulesQuery( siteId ) );
						const site = siteMap.get( siteId );
						if ( site ) {
							recordTracksEvent( 'calypso_scheduled_updates_create_schedule', {
								site_slug: site.slug,
								frequency,
								plugins_number: plugins.length,
								hours,
								weekday: weekdayIndex,
							} );
						}
					} catch ( e ) {
						errors.push( `Create failed for site ${ siteId }` );
					}
				} )
			);

			// Create monitors for successfully scheduled sites
			const monitorTasks = toCreate
				.map( ( id ) => siteMap.get( id ) )
				.filter( ( site ): site is Site => Boolean( site ) )
				.map( ( site ) => async () => {
					await createMonitorForSite( {
						siteId: site.ID,
						body: {
							urls: [
								{ monitor_url: site.URL, check_interval: CRON_CHECK_INTERVAL },
								{ monitor_url: site.URL + '/wp-cron.php', check_interval: CRON_CHECK_INTERVAL },
							],
						},
					} );
				} );
			await runWithConcurrency( monitorTasks, 4 );

			// Run edits
			await Promise.all(
				toEdit.map( async ( siteId ) => {
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

			// Run deletes
			await Promise.all(
				toDelete.map( async ( siteId ) => {
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

			// Invalidate hosting aggregate schedules so list/collisions refresh
			await queryClient.invalidateQueries( hostingUpdateSchedulesQuery() );

			if ( errors.length ) {
				throw new Error( errors.join( '\n' ) );
			}
		},
		[ scheduleId, originalSiteIds, eligibleSites, recordTracksEvent, createMonitorForSite ]
	);

	return { mutateAsync } as const;
}
