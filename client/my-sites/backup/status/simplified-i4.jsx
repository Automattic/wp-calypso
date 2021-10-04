import { useSelector } from 'react-redux';
import BackupCard from 'calypso/components/jetpack/backup-card';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import MostRecentStatus from 'calypso/components/jetpack/daily-backup-status/index-alternate';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getDeltaActivities, isSuccessfulDailyBackup } from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { useDailyBackupStatus, useRealtimeBackupStatus } from './hooks';

import './style.scss';

export const DailyStatus = ( { selectedDate } ) => {
	const siteId = useSelector( getSelectedSiteId );

	const dateWithOffset = useDateWithOffset( selectedDate );
	const moment = useLocalizedMoment();

	const {
		isLoading,
		mostRecentBackupEver,
		lastBackupBeforeDate,
		lastBackupAttemptOnDate,
		rawDeltas,
	} = useDailyBackupStatus( siteId, dateWithOffset );

	// Eagerly cache requests for the days before and after our selected date, to make navigation smoother
	useDailyBackupStatus( siteId, moment( dateWithOffset ).subtract( 1, 'day' ) );
	useDailyBackupStatus( siteId, moment( dateWithOffset ).add( 1, 'day' ) );

	const lastBackupDate = useDateWithOffset( lastBackupBeforeDate?.activityTs, {
		shouldExecute: !! lastBackupBeforeDate,
	} );

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
						selectedDate: dateWithOffset,
						lastBackupDate,
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

	const moment = useLocalizedMoment();

	const {
		isLoading,
		mostRecentBackupEver,
		lastBackupBeforeDate,
		lastBackupAttemptOnDate,
		lastSuccessfulBackupOnDate,
		backupAttemptsOnDate,
		rawDeltas,
	} = useRealtimeBackupStatus( siteId, selectedDate );

	// Eagerly cache requests for the days before and after our selected date, to make navigation smoother
	useRealtimeBackupStatus( siteId, moment( selectedDate ).subtract( 1, 'day' ) );
	useRealtimeBackupStatus( siteId, moment( selectedDate ).add( 1, 'day' ) );

	const lastBackupDate = useDateWithOffset( lastBackupBeforeDate?.activityTs, {
		shouldExecute: !! lastBackupBeforeDate,
	} );

	if ( isLoading ) {
		return <BackupPlaceholder showDatePicker={ false } />;
	}

	const isLatestBackup =
		mostRecentBackupEver &&
		lastBackupAttemptOnDate &&
		mostRecentBackupEver.activityId === lastBackupAttemptOnDate.activityId;

	// If the latest backup for this date is a full backup,
	// show details about what it contains
	const dailyDeltas = getDeltaActivities(
		lastBackupAttemptOnDate && isSuccessfulDailyBackup( lastBackupAttemptOnDate )
			? rawDeltas
			: [ lastBackupAttemptOnDate ].filter( ( i ) => i )
	);

	return (
		<ul className="status__card-list">
			<li key="daily-backup-status">
				<MostRecentStatus
					{ ...{
						selectedDate,
						lastBackupDate,
						backup: lastSuccessfulBackupOnDate || lastBackupAttemptOnDate,
						isLatestBackup,
						dailyDeltas,
					} }
				/>
			</li>

			{ backupAttemptsOnDate.map( ( activity ) => (
				<li key={ activity.activityId }>
					<BackupCard activity={ activity } />
				</li>
			) ) }
		</ul>
	);
};
