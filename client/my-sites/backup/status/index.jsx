/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import BackupDelta from 'calypso/components/jetpack/backup-delta';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import MostRecentStatus from 'calypso/components/jetpack/daily-backup-status';
import { useDateWithOffset } from '../hooks';
import { useDailyBackupStatus, useRealtimeBackupStatus } from './hooks';

/**
 * Style dependencies
 */
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

	const lastBackupDate = useDateWithOffset( lastBackupBeforeDate?.activityTs, {
		shouldExecute: !! lastBackupBeforeDate,
	} );

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

	const moment = useLocalizedMoment();

	const {
		isLoading,
		lastBackupBeforeDate,
		lastBackupAttemptOnDate,
		lastSuccessfulBackupOnDate,
		backupAttemptsOnDate,
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

	return (
		<>
			<MostRecentStatus
				{ ...{
					selectedDate,
					lastBackupDate,
					backup: lastSuccessfulBackupOnDate || lastBackupAttemptOnDate,
				} }
			/>

			{ lastBackupAttemptOnDate && (
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
