import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import {
	BACKUP_ACTIONS,
	DELTA_ACTIVITIES,
	getDeltaActivities,
	getDeltaActivitiesByType,
	isActivityBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { useFirstMatchingBackupAttempt, useMatchingBackupAttemptsInRange } from '../hooks';

const useLatestBackupAttempt = ( siteId, { before, after, successOnly = false } = {} ) => {
	return useFirstMatchingBackupAttempt( siteId, {
		before,
		after,
		successOnly,
		sortOrder: 'desc',
	} );
};

const useBackupDeltas = ( siteId, { before, after, number = 1000 } = {}, enabled = true ) => {
	const filter = {
		name: DELTA_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		number,
		action: BACKUP_ACTIONS,
	};

	const isValidRequest = filter.before && filter.after;

	const { data, isLoading } = useActivityLogQuery( siteId, filter, {
		enabled: isValidRequest && enabled,
	} );

	return {
		isLoading,
		deltas: getDeltaActivitiesByType( data ?? [] ),
	};
};

const useRawBackupDeltas = ( siteId, { before, after, number = 1000 } = {}, enabled = true ) => {
	const filter = {
		name: DELTA_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		number,
		action: BACKUP_ACTIONS,
	};

	const isValidRequest = filter.before && filter.after;

	const { data, isLoading } = useActivityLogQuery( siteId, filter, {
		enabled: isValidRequest && enabled,
	} );

	return {
		isLoading,
		deltas: getDeltaActivities( data ?? [] ),
	};
};

// Get the dates where there are no successful backups in a range
export const useDatesWithNoSuccessfulBackups = ( siteId, startDate, endDate ) => {
	const moment = useLocalizedMoment();
	const timezone = useSelector( ( state ) =>
		siteId ? getSiteTimezoneValue( state, siteId ) : null
	);
	const gmtOffset = useSelector( ( state ) =>
		siteId ? getSiteGmtOffset( state, siteId ) : null
	);

	// Adapted from useDateWithOffsetHook to move dates based on the selected blog's GMT offset.
	const adjustDate = ( date ) =>
		date ? applySiteOffset( date, { timezone, gmtOffset, keepLocalTime: false } ) : undefined;

	// This will get a set of activity logs
	const { isLoading, backups } = useMatchingBackupAttemptsInRange( siteId, {
		after: moment( startDate ).startOf( 'day' ),
		before: moment( endDate ).endOf( 'day' ),
	} );

	const datesWithoutBackups = useMemo( () => {
		const endMoment = moment( endDate ).endOf( 'day' );
		const movingDate = moment( startDate ).startOf( 'day' );
		const dates = [];

		// Collect an array of all the dates in the range
		while ( movingDate < endMoment ) {
			dates.push( movingDate.format( 'MM-DD-YYYY' ) );
			movingDate.add( 1, 'day' );
		}

		if ( backups ) {
			backups.forEach( ( item ) => {
				// Remove dates from the dates array that have backups
				// This should leave only dates that have no backups in the array
				const backupDate = adjustDate( item.activityDate ).format( 'MM-DD-YYYY' );
				if ( dates.indexOf( backupDate ) > -1 ) {
					dates.splice( dates.indexOf( backupDate ), 1 );
				}
			} );
		}

		return dates;
	}, [ startDate, endDate, backups ] );

	return {
		isLoading,
		dates: datesWithoutBackups,
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

	const activityLog = useActivityLogQuery(
		siteId,
		{
			before: moment( selectedDate ).endOf( 'day' ).toISOString(),
			after: moment( selectedDate ).startOf( 'day' ).toISOString(),
		},
		{
			select: ( data ) =>
				data.filter( ( a ) => isActivityBackup( a ) || isSuccessfulRealtimeBackup( a ) ),
		}
	);

	const backupAttemptsOnDate = activityLog.data ?? [];
	const lastBackupAttemptOnDate = backupAttemptsOnDate[ 0 ];
	const lastSuccessfulBackupOnDate = backupAttemptsOnDate.find( isSuccessfulRealtimeBackup );
	const lastAttemptWasSuccessful =
		lastBackupAttemptOnDate && isSuccessfulRealtimeBackup( lastBackupAttemptOnDate );

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
			activityLog.isLoading ||
			rawDeltas.isLoading,
		mostRecentBackupEver: mostRecentBackupEver.backupAttempt,
		lastBackupBeforeDate: lastBackupBeforeDate.backupAttempt,
		lastBackupAttemptOnDate,
		lastSuccessfulBackupOnDate,
		backupAttemptsOnDate,
		rawDeltas: rawDeltas.deltas,
	};
};
