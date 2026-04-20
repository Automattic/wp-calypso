import { queryClient, hostingUpdateSchedulesQuery } from '@automattic/api-queries';
import { useCallback, useMemo } from 'react';
import { useCreateSchedules } from './use-create-schedules';
import { useDeleteSchedules } from './use-delete-schedules';
import { useEditSchedules } from './use-edit-schedules';
import type { Frequency, Weekday } from '../types';

type Inputs = {
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string; // HH:MM 24h
};

/**
 * Reconcile plugin update schedules across sites for a given schedule ID and track analytics.
 *
 * Operations performed on submit:
 * - Create: computes `toCreate` (sites added to the schedule) and delegates to `useCreateSchedules`
 * to batch-create schedules, including Tracks + Jetpack Monitor side-effects.
 * - Edit: computes `toEdit` (sites that keep the schedule) and delegates to `useEditSchedules`
 * to batch-edit schedule parameters and track edit analytics.
 * - Delete: computes `toDelete` (sites removed from the schedule) and delegates to
 * `useDeleteSchedules` to batch-delete the schedule and track delete analytics.
 * - Cache: invalidates the hosting aggregate query after all operations complete.
 *
 * Note: Batch hooks normalize the provided schedule ID where needed; no optimistic updates.
 * @param {string} scheduleId The (possibly suffixed) schedule identifier from the route.
 * @param {string[]} scheduleSiteIds The sites currently participating in the schedule.
 * @param {string[]} selectedSiteIds The sites currently selected in the form (live state).
 * @returns {{ mutateAsync: ( inputs: { plugins: string[]; frequency: Frequency; weekday: Weekday; time: string } ) => Promise< void > }} Hook API
 */
export function useReconcileSchedules(
	scheduleId: string,
	scheduleSiteIds: string[],
	selectedSiteIds: string[]
) {
	const toCreate = useMemo( () => {
		const current = new Set( selectedSiteIds.map( Number ) );
		const original = new Set( scheduleSiteIds.map( Number ) );
		return Array.from( current ).filter( ( id ) => ! original.has( id ) );
	}, [ selectedSiteIds, scheduleSiteIds ] );

	const toEdit = useMemo( () => {
		const current = new Set( selectedSiteIds.map( Number ) );
		const original = new Set( scheduleSiteIds.map( Number ) );
		return Array.from( current ).filter( ( id ) => original.has( id ) );
	}, [ selectedSiteIds, scheduleSiteIds ] );

	const toDelete = useMemo( () => {
		const current = new Set( selectedSiteIds.map( Number ) );
		const original = new Set( scheduleSiteIds.map( Number ) );
		return Array.from( original ).filter( ( id ) => ! current.has( id ) );
	}, [ selectedSiteIds, scheduleSiteIds ] );

	const { mutateAsync: runCreate } = useCreateSchedules( toCreate );
	const { mutateAsync: runEdit } = useEditSchedules( toEdit, scheduleId );
	const { mutateAsync: runDelete } = useDeleteSchedules( toDelete, scheduleId );

	const mutateAsync = useCallback(
		async ( { plugins, frequency, weekday, time }: Inputs ) => {
			const tasks: Promise< unknown >[] = [];
			if ( toCreate.length ) {
				tasks.push( runCreate( { plugins, frequency, weekday, time } ) );
			}
			if ( toEdit.length ) {
				tasks.push( runEdit( { plugins, frequency, weekday, time } ) );
			}
			if ( toDelete.length ) {
				tasks.push( runDelete() );
			}

			await Promise.all( tasks );
			await queryClient.invalidateQueries( hostingUpdateSchedulesQuery() );
		},
		[ toCreate, toEdit, toDelete, runCreate, runEdit, runDelete ]
	);

	return { mutateAsync } as const;
}
