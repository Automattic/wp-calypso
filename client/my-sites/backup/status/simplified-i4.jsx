/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getDeltaActivities } from 'calypso/lib/jetpack/backup-utils';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useApplySiteOffset } from 'calypso/components/site-offset';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import BackupCard from 'calypso/components/jetpack/backup-card';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import MostRecentStatus from 'calypso/components/jetpack/daily-backup-status/index-alternate';
import { useDailyBackupStatus, useRealtimeBackupStatus } from './hooks';

/**
 * Style dependencies
 */
import './style.scss';

export const DailyStatus = ( { selectedDate } ) => {
	const siteId = useSelector( getSelectedSiteId );

	const applySiteOffset = useApplySiteOffset();
	const moment = useLocalizedMoment();

	const {
		isLoading,
		mostRecentBackupEver,
		lastBackupBeforeDate,
		lastBackupAttemptOnDate,
		rawDeltas,
	} = useDailyBackupStatus( siteId, selectedDate );

	// Eagerly cache requests for the days before and after our selected date, to make navigation smoother
	useDailyBackupStatus( siteId, moment( selectedDate ).subtract( 1, 'day' ) );
	useDailyBackupStatus( siteId, moment( selectedDate ).add( 1, 'day' ) );

	if ( isLoading ) {
		return <BackupPlaceholder showDatePicker={ false } />;
	}

	const isLatestBackup =
		lastBackupAttemptOnDate &&
		mostRecentBackupEver &&
		lastBackupAttemptOnDate.activityId === mostRecentBackupEver.activityId;

	return (
		<ul className="status__card-list">
			<li key="daily-backup-status">
				<MostRecentStatus
					{ ...{
						selectedDate,
						lastBackupDate:
							lastBackupBeforeDate && applySiteOffset( lastBackupBeforeDate.activityTs ),
						backup: lastBackupAttemptOnDate,
						isLatestBackup,
						dailyDeltas: rawDeltas,
					} }
				/>
			</li>
		</ul>
	);
};

export const RealtimeStatus = ( { selectedDate } ) => {
	const siteId = useSelector( getSelectedSiteId );

	const applySiteOffset = useApplySiteOffset();
	const moment = useLocalizedMoment();

	const {
		isLoading,
		mostRecentBackupEver,
		lastBackupBeforeDate,
		lastBackupAttemptOnDate,
		earlierBackupAttemptsOnDate,
	} = useRealtimeBackupStatus( siteId, selectedDate );

	// Eagerly cache requests for the days before and after our selected date, to make navigation smoother
	useRealtimeBackupStatus( siteId, moment( selectedDate ).subtract( 1, 'day' ) );
	useRealtimeBackupStatus( siteId, moment( selectedDate ).add( 1, 'day' ) );

	if ( isLoading ) {
		return <BackupPlaceholder showDatePicker={ false } />;
	}

	const isLatestBackup =
		mostRecentBackupEver &&
		lastBackupAttemptOnDate &&
		mostRecentBackupEver.activityId === lastBackupAttemptOnDate.activityId;

	const dailyDeltas = getDeltaActivities( [ lastBackupAttemptOnDate ].filter( ( i ) => i ) );

	return (
		<ul className="status__card-list">
			<li key="daily-backup-status">
				<MostRecentStatus
					{ ...{
						selectedDate,
						lastBackupDate:
							lastBackupBeforeDate && applySiteOffset( lastBackupBeforeDate.activityTs ),
						backup: lastBackupAttemptOnDate,
						isLatestBackup,
						dailyDeltas,
					} }
				/>
			</li>

			{ earlierBackupAttemptsOnDate.map( ( activity ) => (
				<li key={ activity.activityId }>
					<BackupCard activity={ activity } />
				</li>
			) ) }
		</ul>
	);
};
