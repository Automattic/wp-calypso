import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import {
	DELTA_ACTIVITIES,
	getDeltaActivitiesByType,
	isActivityBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { useFirstMatchingBackupAttempt, useMatchingBackupAttemptsInRange } from '../hooks';

const useLatestBackupAttempt = (
	siteId,
	{ before, after, successOnly = false } = {},
	queryOptions = {}
) => {
	return useFirstMatchingBackupAttempt(
		siteId,
		{
			before,
			after,
			successOnly,
			sortOrder: 'desc',
		},
		queryOptions
	);
};

const useBackupDeltas = ( siteId, { before, after, number = 1000 } = {}, enabled = true ) => {
	const filter = {
		name: DELTA_ACTIVITIES,
		before: before ? before.toISOString() : undefined,
		after: after ? after.toISOString() : undefined,
		number,
	};

	const isValidRequest = filter.before && filter.after;

	const { data, isInitialLoading } = useRewindableActivityLogQuery( siteId, filter, {
		enabled: isValidRequest && enabled,
		refetchOnWindowFocus: false,
	} );

	return {
		isInitialLoading,
		deltas: getDeltaActivitiesByType( data ?? [] ),
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
				if ( dates.indexOf( backupDate ) > -1 && item.activityIsRewindable ) {
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

	const isToday = useMemo(
		() => moment().isSame( moment( selectedDate ), 'day' ),
		[ moment, selectedDate ]
	);

	const lastBackupBeforeDate = useLatestBackupAttempt(
		siteId,
		{
			before: moment( selectedDate ).startOf( 'day' ),
			successOnly: true,
		},
		{ refetchOnWindowFocus: false }
	);
	const lastAttemptOnDate = useLatestBackupAttempt(
		siteId,
		{
			after: moment( selectedDate ).startOf( 'day' ),
			before: moment( selectedDate ).endOf( 'day' ),
		},
		{ refetchOnWindowFocus: isToday }
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
		!! ( hasPreviousBackup && successfulLastAttempt )
	);

	return {
		isLoading:
			lastBackupBeforeDate.isLoading ||
			lastAttemptOnDate.isLoading ||
			backupDeltas.isInitialLoading,
		lastBackupBeforeDate: lastBackupBeforeDate.backupAttempt,
		lastBackupAttemptOnDate: lastAttemptOnDate.backupAttempt,
		deltas: backupDeltas.deltas,
	};
};

export const useRealtimeBackupStatus = ( siteId, selectedDate ) => {
	const moment = useLocalizedMoment();

	const isToday = useMemo(
		() => moment().isSame( moment( selectedDate ), 'day' ),
		[ moment, selectedDate ]
	);

	// This is the last attempt irrespective of date
	const lastBackupAttempt = useLatestBackupAttempt( siteId );

	const lastBackupBeforeDate = useLatestBackupAttempt(
		siteId,
		{
			before: moment( selectedDate ).startOf( 'day' ),
			successOnly: true,
		},
		{ refetchOnWindowFocus: false }
	);

	const activityLog = useRewindableActivityLogQuery(
		siteId,
		{
			before: moment( selectedDate ).endOf( 'day' ).toISOString(),
			after: moment( selectedDate ).startOf( 'day' ).toISOString(),
		},
		{
			select: ( data ) =>
				data.filter( ( a ) => isActivityBackup( a ) || isSuccessfulRealtimeBackup( a ) ),
			refetchOnWindowFocus: isToday,
		}
	);

	const backupAttemptsOnDate = activityLog.data ?? [];
	const lastBackupAttemptOnDate = backupAttemptsOnDate[ 0 ];
	const lastSuccessfulBackupOnDate = backupAttemptsOnDate.find( isSuccessfulRealtimeBackup );

	return {
		isLoading: lastBackupBeforeDate.isLoading || activityLog.isLoading,
		lastBackupBeforeDate: lastBackupBeforeDate.backupAttempt,
		lastBackupAttempt: lastBackupAttempt.backupAttempt,
		lastBackupAttemptOnDate,
		lastSuccessfulBackupOnDate,
		backupAttemptsOnDate,
		refetch: activityLog.refetch,
	};
};
