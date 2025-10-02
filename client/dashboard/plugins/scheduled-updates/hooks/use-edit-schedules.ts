import {
	createSiteUpdateSchedule,
	editSiteUpdateSchedule,
	deleteSiteUpdateSchedule,
	type CreateSiteUpdateScheduleBody,
	type EditSiteUpdateScheduleBody,
} from '@automattic/api-core';
import { queryClient, siteUpdateSchedulesQuery } from '@automattic/api-queries';
import { useCallback } from '@wordpress/element';
import { normalizeScheduleId, prepareTimestamp } from '../helpers';
import type { Frequency, Weekday } from '../types';

type Inputs = {
	siteIds: number[]; // selected sites after user edits
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
 * - Invalidates per-site schedule queries after each operation
 *
 * Resolves when all operations complete; rejects if any operation fails.
 * @param {string} scheduleId The (possibly suffixed) schedule identifier from the route.
 * @param {number[]} originalSiteIds The sites currently participating in the schedule.
 * @returns {{ mutateAsync: ( inputs: Inputs ) => Promise< void > }} Hook API
 */
export function useEditSchedules( scheduleId: string, originalSiteIds: number[] ) {
	const mutateAsync = useCallback(
		async ( { siteIds, plugins, frequency, weekday, time }: Inputs ) => {
			const timestamp = prepareTimestamp( frequency, weekday, time );
			const body: EditSiteUpdateScheduleBody & CreateSiteUpdateScheduleBody = {
				plugins,
				schedule: { interval: frequency, timestamp },
				health_check_paths: [],
			};

			const normalizedId = normalizeScheduleId( scheduleId );

			const selected = new Set( siteIds );
			const original = new Set( originalSiteIds );

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

			// Run creates
			await Promise.all(
				toCreate.map( async ( siteId ) => {
					try {
						await createSiteUpdateSchedule( siteId, body );
						await queryClient.invalidateQueries( siteUpdateSchedulesQuery( siteId ) );
					} catch ( e ) {
						errors.push( `Create failed for site ${ siteId }` );
					}
				} )
			);

			// Run edits
			await Promise.all(
				toEdit.map( async ( siteId ) => {
					try {
						await editSiteUpdateSchedule( siteId, normalizedId, body );
						await queryClient.invalidateQueries( siteUpdateSchedulesQuery( siteId ) );
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
					} catch ( e ) {
						errors.push( `Delete failed for site ${ siteId }` );
					}
				} )
			);

			if ( errors.length ) {
				throw new Error( errors.join( '\n' ) );
			}
		},
		[ scheduleId, originalSiteIds ]
	);

	return { mutateAsync } as const;
}
