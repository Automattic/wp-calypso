/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import BackupDatePicker from 'calypso/components/jetpack/backup-date-picker';
import { useDateWithOffset, useFirstMatchingBackupAttempt } from './hooks';

const useFirstKnownBackupAttempt = ( siteId ) => {
	return useFirstMatchingBackupAttempt( siteId, { sortOrder: 'asc' } );
};

const DatePicker = ( { onSelectDate, selectedDate } ) => {
	const siteId = useSelector( getSelectedSiteId );

	const firstKnownBackupAttempt = useFirstKnownBackupAttempt( siteId );
	const oldestDateAvailable = useDateWithOffset(
		firstKnownBackupAttempt.backupAttempt?.activityTs,
		{ shouldExecute: !! firstKnownBackupAttempt.backupAttempt }
	);

	return (
		<BackupDatePicker
			selectedDate={ selectedDate }
			oldestDateAvailable={ oldestDateAvailable }
			onDateChange={ onSelectDate }
		/>
	);
};

export default DatePicker;
