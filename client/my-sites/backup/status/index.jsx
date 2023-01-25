import { useSelector } from 'react-redux';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import BackupDelta from 'calypso/components/jetpack/backup-delta';
import BackupGettingStarted from 'calypso/components/jetpack/backup-getting-started';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import MostRecentStatus from 'calypso/components/jetpack/daily-backup-status';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import isRewindBackupsInitialized from 'calypso/state/rewind/selectors/is-rewind-backups-initialized';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { useIsDateVisible } from '../hooks';
import { useDailyBackupStatus, useRealtimeBackupStatus } from './hooks';

export const DailyStatus = ( { selectedDate, usageLevel } ) => {
	const siteId = useSelector( getSelectedSiteId );

	const { isLoading, lastBackupBeforeDate, lastBackupAttemptOnDate, deltas } = useDailyBackupStatus(
		siteId,
		selectedDate
	);

	const lastBackupDate = useDateWithOffset( lastBackupBeforeDate?.activityTs );

	if ( isLoading ) {
		return <BackupPlaceholder showDatePicker={ false } />;
	}

	return (
		<MostRecentStatus
			{ ...{
				selectedDate,
				lastBackupDate,
				backup: lastBackupAttemptOnDate,
				deltas,
				lastBackupAttemptOnDate,
				usageLevel,
			} }
		/>
	);
};

export const RealtimeStatus = ( { selectedDate, usageLevel } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isDateVisible = useIsDateVisible( siteId );

	const moment = useLocalizedMoment();

	const {
		isLoading,
		lastBackupBeforeDate,
		lastBackupAttempt,
		lastBackupAttemptOnDate,
		lastSuccessfulBackupOnDate,
		backupAttemptsOnDate,
	} = useRealtimeBackupStatus( siteId, selectedDate );

	const lastBackupDate = useDateWithOffset( lastBackupBeforeDate?.activityTs );

	const isInitialized = useSelector( ( state ) => isRewindBackupsInitialized( state, siteId ) );

	if ( isLoading || ! isInitialized ) {
		return (
			<>
				<BackupPlaceholder showDatePicker={ false } />
				<QueryRewindBackups siteId={ siteId } />
			</>
		);
	}

	return (
		<>
			<MostRecentStatus
				{ ...{
					selectedDate,
					lastBackupDate,
					backup: lastSuccessfulBackupOnDate || lastBackupAttemptOnDate,
					lastBackupAttempt,
					lastBackupAttemptOnDate,
					usageLevel,
				} }
			/>

			<BackupGettingStarted />

			{ isDateVisible( selectedDate ) && lastBackupAttemptOnDate && (
				<BackupDelta
					{ ...{
						realtimeBackups: backupAttemptsOnDate,
						isToday: moment().isSame( selectedDate, 'day' ),
					} }
				/>
			) }
		</>
	);
};
