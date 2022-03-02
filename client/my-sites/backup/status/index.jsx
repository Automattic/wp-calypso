import { useSelector } from 'react-redux';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import BackupDelta from 'calypso/components/jetpack/backup-delta';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import MostRecentStatus from 'calypso/components/jetpack/daily-backup-status';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import isRewindBackupsInitialized from 'calypso/state/rewind/selectors/is-rewind-backups-initialized';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { useIsDateVisible } from '../hooks';
import { useDailyBackupStatus, useRealtimeBackupStatus } from './hooks';

import './style.scss';

export const DailyStatus = ( { selectedDate } ) => {
	const siteId = useSelector( getSelectedSiteId );

	const moment = useLocalizedMoment();

	const { isLoading, lastBackupBeforeDate, lastBackupAttemptOnDate, deltas } = useDailyBackupStatus(
		siteId,
		selectedDate
	);

	// Eagerly cache requests for the days before and after our selected date, to make navigation smoother
	useDailyBackupStatus( siteId, moment( selectedDate ).subtract( 1, 'day' ) );
	useDailyBackupStatus( siteId, moment( selectedDate ).add( 1, 'day' ) );

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
			} }
		/>
	);
};

export const RealtimeStatus = ( { selectedDate } ) => {
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

	// Eagerly cache requests for the days before and after our selected date, to make navigation smoother
	useRealtimeBackupStatus( siteId, moment( selectedDate ).subtract( 1, 'day' ) );
	useRealtimeBackupStatus( siteId, moment( selectedDate ).add( 1, 'day' ) );

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
				} }
			/>

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
