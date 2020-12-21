/**
 * External dependencies
 */
import { useMemo } from 'react';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	DELTA_ACTIVITIES,
	getDeltaActivities,
	getDeltaActivitiesByType,
	isActivityBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import { useActivityLogs, useFirstMatchingBackupAttempt } from '../hooks';

const useLatestBackupAttempt = (
	siteId,
	{ before, after, successOnly = false } = {},
	{ forceRefresh = false } = {}
) => {
	return useFirstMatchingBackupAttempt(
		siteId,
		{
			before,
			after,
			successOnly,
			sortOrder: 'desc',
		},
		{ forceRefresh }
	);
};

const useBackupDeltas = (
	siteId,
	{ before, after, number = 1000 } = {},
	{ shouldExecute = true, forceRefresh = false } = {}
) => {
	const filter = {
		name: DELTA_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		number,
	};

	const isValidRequest = filter.before && filter.after;

	const { isLoadingActivityLogs, activityLogs } = useActivityLogs( siteId, filter, {
		shouldExecute: !! ( isValidRequest && shouldExecute ),
		forceRefresh,
	} );

	return {
		isLoadingDeltas: !! ( shouldExecute && isLoadingActivityLogs ),
		deltas: getDeltaActivitiesByType( activityLogs ),
	};
};

const useRawBackupDeltas = (
	siteId,
	{ before, after, number = 1000 } = {},
	{ shouldExecute = true, forceRefresh = false } = {}
) => {
	const filter = {
		name: DELTA_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		number,
	};

	const isValidRequest = filter.before && filter.after;

	const { isLoadingActivityLogs, activityLogs } = useActivityLogs( siteId, filter, {
		shouldExecute: !! ( isValidRequest && shouldExecute ),
		forceRefresh,
	} );

	return {
		isLoadingDeltas: !! ( shouldExecute && isLoadingActivityLogs ),
		deltas: getDeltaActivities( activityLogs ),
	};
};

export const useDailyBackupStatus = ( siteId, selectedDate, { forceRefresh = false } = {} ) => {
	const moment = useLocalizedMoment();

	const lastBackupBeforeDate = useLatestBackupAttempt(
		siteId,
		{
			before: moment( selectedDate ).startOf( 'day' ),
			successOnly: true,
		},
		{ forceRefresh }
	);
	const lastAttemptOnDate = useLatestBackupAttempt(
		siteId,
		{
			after: moment( selectedDate ).startOf( 'day' ),
			before: moment( selectedDate ).endOf( 'day' ),
		},
		{ forceRefresh }
	);

	const mostRecentBackupEver = useLatestBackupAttempt(
		siteId,
		{
			successOnly: true,
		},
		{ forceRefresh }
	);

	const hasPreviousBackup = ! lastBackupBeforeDate.isLoading && lastBackupBeforeDate.backupAttempt;
	const successfulLastAttempt =
		! lastAttemptOnDate.isLoading && lastAttemptOnDate.backupAttempt?.activityIsRewindable;

	const backupDeltas = useBackupDeltas(
		siteId,
		{
			after: moment( lastBackupBeforeDate.backupAttempt?.activityTs ),
			before: moment( lastAttemptOnDate.backupAttempt?.activityTs ),
		},
		{ shouldExecute: !! ( hasPreviousBackup && successfulLastAttempt ), forceRefresh }
	);

	const rawBackupDeltas = useRawBackupDeltas(
		siteId,
		{
			after: moment( lastBackupBeforeDate.backupAttempt?.activityTs ),
			before: moment( lastAttemptOnDate.backupAttempt?.activityTs ),
		},
		{ shouldExecute: !! ( hasPreviousBackup && successfulLastAttempt ), forceRefresh }
	);

	return {
		isLoading:
			mostRecentBackupEver.isLoading ||
			lastBackupBeforeDate.isLoading ||
			lastAttemptOnDate.isLoading ||
			backupDeltas.isLoading ||
			rawBackupDeltas.isLoading,
		mostRecentBackupEver: mostRecentBackupEver.backupAttempt,
		lastBackupBeforeDate: lastBackupBeforeDate.backupAttempt,
		lastBackupAttemptOnDate: lastAttemptOnDate.backupAttempt,
		lastSuccessfulBackupOnDate: successfulLastAttempt ? lastAttemptOnDate.backupAttempt : undefined,
		deltas: backupDeltas.deltas,
		rawDeltas: rawBackupDeltas.deltas,
	};
};

export const useRealtimeBackupStatus = ( siteId, selectedDate, { forceRefresh = false } = {} ) => {
	const moment = useLocalizedMoment();

	const mostRecentBackupEver = useLatestBackupAttempt(
		siteId,
		{
			successOnly: true,
		},
		{ forceRefresh }
	);

	const lastBackupBeforeDate = useLatestBackupAttempt(
		siteId,
		{
			before: moment( selectedDate ).startOf( 'day' ),
			successOnly: true,
		},
		{ forceRefresh }
	);

	const { activityLogs, isLoadingActivityLogs } = useActivityLogs(
		siteId,
		{
			before: moment( selectedDate ).endOf( 'day' ).toISOString(),
			after: moment( selectedDate ).startOf( 'day' ).toISOString(),
		},
		{ forceRefresh }
	);

	const {
		backupAttemptsOnDate,
		lastBackupAttemptOnDate,
		lastSuccessfulBackupOnDate,
		lastAttemptWasSuccessful,
	} = useMemo( () => {
		const attemptsOnDate = activityLogs.filter(
			( a ) => isActivityBackup( a ) || isSuccessfulRealtimeBackup( a )
		);

		return {
			backupAttemptsOnDate: attemptsOnDate,
			lastBackupAttemptOnDate: attemptsOnDate[ 0 ],
			lastSuccessfulBackupOnDate: attemptsOnDate.find( isSuccessfulRealtimeBackup ),
			lastAttemptWasSuccessful:
				attemptsOnDate[ 0 ] && isSuccessfulRealtimeBackup( attemptsOnDate[ 0 ] ),
		};
	}, [ activityLogs ] );

	const hasPreviousBackup = ! lastBackupBeforeDate.isLoading && lastBackupBeforeDate.backupAttempt;

	const rawDeltas = useRawBackupDeltas(
		siteId,
		{
			before: moment( lastBackupAttemptOnDate?.activityTs ),
			after: moment( lastBackupBeforeDate.backupAttempt?.activityTs ),
		},
		{ shouldExecute: !! ( hasPreviousBackup && lastAttemptWasSuccessful ), forceRefresh }
	);

	return {
		isLoading:
			mostRecentBackupEver.isLoading ||
			lastBackupBeforeDate.isLoading ||
			isLoadingActivityLogs ||
			rawDeltas.isLoading,
		mostRecentBackupEver: mostRecentBackupEver.backupAttempt,
		lastBackupBeforeDate: lastBackupBeforeDate.backupAttempt,
		lastBackupAttemptOnDate,
		lastSuccessfulBackupOnDate,
		backupAttemptsOnDate,
		rawDeltas: rawDeltas.deltas,
	};
};
