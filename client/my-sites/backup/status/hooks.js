/**
 * External dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import {
	DELTA_ACTIVITIES,
	getDeltaActivities,
	getDeltaActivitiesByType,
	isActivityBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import getSiteActivityLogRetentionDays from 'calypso/state/selectors/get-site-activity-log-retention-days';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { useActivityLogs, useFirstMatchingBackupAttempt } from '../hooks';

/**
 * A React hook that creates a callback to test whether or not a given date is
 * within a site's Backup retention period (if retention periods are enabled).
 *
 * @param {number|null} siteId The site whose retention period we'll be testing against.
 * @returns A callback that returns true if a given date is outside the site's retention period, and false otherwise.
 */
export const useIsDateBeyondRetentionPeriod = ( siteId ) => {
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const retentionDays = useSelector( ( state ) =>
		getSiteActivityLogRetentionDays( state, siteId )
	);

	return useCallback(
		( date ) => {
			if ( ! isEnabled( 'activity-log/retention-policies' ) ) {
				return false;
			}

			if ( retentionDays === undefined ) {
				return false;
			}

			const today = applySiteOffset( Date.now(), { gmtOffset, timezone } ).startOf( 'day' );
			return today.diff( date, 'days' ) > retentionDays;
		},
		[ gmtOffset, timezone, retentionDays ]
	);
};

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
