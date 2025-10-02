import {
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
} from '@automattic/api-queries';
import { useCallback, useMemo } from '@wordpress/element';
import { useAnalytics } from '../../../app/analytics';
import { normalizeScheduleId, prepareTimestamp } from '../helpers';
import { useCreateSchedules } from './use-create-schedules';
import { useEligibleSites } from './use-eligible-sites';
import type { Frequency, Weekday } from '../types';

type Inputs = {
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string; // HH:MM 24h
};

/**
 * Edits plugin update schedules across sites for a given schedule ID.
 *
 * Given the original participating sites and the current selection, returns a `mutateAsync( inputs )`
 * function that:
 * - Diffs sites into create/edit/delete sets based on the new selection
 * - Builds the schedule timestamp from `frequency`, `weekday`, and `time`
 * - Runs batch create via the existing create flow hook, and per-site edit/delete calls
 * - Invalidates per-site schedule queries and the hosting aggregate after all
 * - Emits Tracks analytics for edited/deleted schedules; create events/monitors are handled by the
 *   reused create hook
 *
 * Resolves when all operations complete; rejects if any operation fails.
 * @param {string} scheduleId The (possibly suffixed) schedule identifier from the route.
 * @param {string[]} originalSiteIds The sites currently participating in the schedule.
 * @param {string[]} selectedSiteIds The sites currently selected in the form (live state).
 * @returns {{ mutateAsync: ( inputs: Inputs ) => Promise< void > }} Hook API
 */
export function useEditSchedules(
	scheduleId: string,
	originalSiteIds: string[],
	selectedSiteIds: string[]
) {
	const { recordTracksEvent } = useAnalytics();
	const { data: eligibleSites = [] } = useEligibleSites();
	const normalizedId = normalizeScheduleId( scheduleId );

	// Compute create subset once per render for hook composition
	const toCreate = useMemo( () => {
		const current = new Set( selectedSiteIds.map( Number ) );
		const original = new Set( originalSiteIds.map( Number ) );
		return Array.from( current ).filter( ( id ) => ! original.has( id ) );
	}, [ selectedSiteIds, originalSiteIds ] );

	// Instantiate the existing batch create hook for the create subset
	const { mutateAsync: runCreate } = useCreateSchedules( toCreate );

	const mutateAsync = useCallback(
		async ( { plugins, frequency, weekday, time }: Inputs ) => {
			const timestamp = prepareTimestamp( frequency, weekday, time );
			const body: EditSiteUpdateScheduleBody & CreateSiteUpdateScheduleBody = {
				plugins,
				schedule: { interval: frequency, timestamp },
				health_check_paths: [],
			};

			// Compute edit/delete sets from submitted inputs to be authoritative
			const current = new Set( selectedSiteIds.map( Number ) );
			const original = new Set( originalSiteIds.map( Number ) );
			const toEdit = Array.from( current ).filter( ( id ) => original.has( id ) );
			const toDelete = Array.from( original ).filter( ( id ) => ! current.has( id ) );

			const errors: string[] = [];

			// Run creates via shared hook (reuse analytics + monitors)
			if ( toCreate.length > 0 ) {
				try {
					await runCreate( { plugins, frequency, weekday, time } );
				} catch ( e ) {
					errors.push( 'Create failed for one or more sites.' );
				}
			}

			// Map sites for edit/delete analytics
			const siteMap = new Map( ( eligibleSites as Site[] ).map( ( s ) => [ s.ID, s ] ) );
			const eventDate = new Date( timestamp * 1000 );
			const hours = eventDate.getHours();
			const weekdayIndex = frequency === 'weekly' ? eventDate.getDay() : undefined;

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
		[
			selectedSiteIds,
			originalSiteIds,
			toCreate,
			runCreate,
			eligibleSites,
			recordTracksEvent,
			normalizedId,
		]
	);

	return { mutateAsync } as const;
}
