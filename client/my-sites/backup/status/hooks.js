import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	DELTA_ACTIVITIES,
	getDeltaActivities,
	getDeltaActivitiesByType,
	isActivityBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import {
	useActivityLogs,
	useFirstMatchingBackupAttempt,
	useMatchingBackupAttemptsInRange,
} from '../hooks';

const useLatestBackupAttempt = ( siteId, { before, after, successOnly = false } = {} ) => {
	return useFirstMatchingBackupAttempt( siteId, {
		before,
		after,
		successOnly,
		sortOrder: 'desc',
	} );
};

const useBackupDeltas = ( siteId, { before, after, number = 1000 } = {}, shouldExecute = true ) => {
	const filter = {
		name: DELTA_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		number,
	};

	const isValidRequest = filter.before && filter.after;

	const { isLoadingActivityLogs, activityLogs } = useActivityLogs(
		siteId,
		filter,
		!! ( isValidRequest && shouldExecute )
	);

	return {
		isLoadingDeltas: !! ( shouldExecute && isLoadingActivityLogs ),
		deltas: getDeltaActivitiesByType( activityLogs ),
	};
};

const useRawBackupDeltas = (
	siteId,
	{ before, after, number = 1000 } = {},
	shouldExecute = true
) => {
	const filter = {
		name: DELTA_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		number,
	};

	const isValidRequest = filter.before && filter.after;

	const { isLoadingActivityLogs, activityLogs } = useActivityLogs(
		siteId,
		filter,
		!! ( isValidRequest && shouldExecute )
	);

	return {
		isLoadingDeltas: !! ( shouldExecute && isLoadingActivityLogs ),
		deltas: getDeltaActivities( activityLogs ),
	};
};

// Get the dates where there are no successful backups in a range
export const useDatesWithNoSuccessfulBackups = ( siteId, startDate, endDate ) => {
	const moment = useLocalizedMoment();

	// Get the activity log for the range, filtering for only days with successful backups.
	const startMoment = moment( startDate ).startOf( 'day' );
	const endMoment = moment( endDate ).endOf( 'day' );
	const movingDate = moment( startDate ).startOf( 'day' );
	const datesWithoutBackups = [];

	// Collect an array of all the dates in the range
	while ( movingDate < endMoment ) {
		datesWithoutBackups.push( movingDate.format( 'MM-DD-YYYY' ) );
		movingDate.add( 1, 'day' );
	}

	// This will get a set of activity logs
	const { isLoading, backups } = useMatchingBackupAttemptsInRange( siteId, {
		after: startMoment,
		before: endMoment,
	} );

	if ( ! isLoading && backups ) {
		backups.forEach( ( item ) => {
			// Remove dates from the datesWithoutBackups array that have backups
			// This should leave only dates that have no backups in the array
			const backupDate = moment( item.activityDate ).format( 'MM-DD-YYYY' );
			if ( datesWithoutBackups.indexOf( backupDate ) > -1 ) {
				datesWithoutBackups.splice( datesWithoutBackups.indexOf( backupDate ), 1 );
			}
		} );
	}

	return {
		isLoading: isLoading,
		dates: isLoading ? [] : datesWithoutBackups,
	};
};

export const useDailyBackupStatus = ( siteId, selectedDate ) => {
	const moment = useLocalizedMoment();

	const lastBackupBeforeDate = useLatestBackupAttempt( siteId, {
		before: moment( selectedDate ).startOf( 'day' ),
		successOnly: true,
	} );
	const lastAttemptOnDate = useLatestBackupAttempt( siteId, {
		after: moment( selectedDate ).startOf( 'day' ),
		before: moment( selectedDate ).endOf( 'day' ),
	} );

	const mostRecentBackupEver = useLatestBackupAttempt( siteId, {
		successOnly: true,
	} );

	const hasPreviousBackup = ! lastBackupBeforeDate.isLoading && lastBackupBeforeDate.backupAttempt;
	const successfulLastAttempt =
		! lastAttemptOnDate.isLoading && lastAttemptOnDate.backupAttempt?.activityIsRewindable;

	const backupDeltas = useBackupDeltas(
		siteId,
		{
			after: moment( lastBackupBeforeDate.backupAttempt?.activityTs ),
			before: moment( lastAttemptOnDate.backupAttempt?.activityTs ),
		},
		!! ( hasPreviousBackup && successfulLastAttempt )
	);

	const rawBackupDeltas = useRawBackupDeltas(
		siteId,
		{
			after: moment( lastBackupBeforeDate.backupAttempt?.activityTs ),
			before: moment( lastAttemptOnDate.backupAttempt?.activityTs ),
		},
		!! ( hasPreviousBackup && successfulLastAttempt )
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

export const useRealtimeBackupStatus = ( siteId, selectedDate ) => {
	const moment = useLocalizedMoment();

	const mostRecentBackupEver = useLatestBackupAttempt( siteId, {
		successOnly: true,
	} );

	const lastBackupBeforeDate = useLatestBackupAttempt( siteId, {
		before: moment( selectedDate ).startOf( 'day' ),
		successOnly: true,
	} );

	const { activityLogs, isLoadingActivityLogs } = useActivityLogs( siteId, {
		before: moment( selectedDate ).endOf( 'day' ).toISOString(),
		after: moment( selectedDate ).startOf( 'day' ).toISOString(),
	} );

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
		!! ( hasPreviousBackup && lastAttemptWasSuccessful )
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
