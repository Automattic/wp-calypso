/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useApplySiteOffset } from 'calypso/components/site-offset';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BackupDatePicker from 'calypso/components/jetpack/backup-date-picker';
import { useFirstMatchingBackupAttempt } from './hooks';

const useFirstKnownBackupAttempt = ( siteId ) => {
	return useFirstMatchingBackupAttempt( siteId, { sortOrder: 'asc' } );
};

const DatePicker = ( { onSelectDate, selectedDate } ) => {
	const dispatch = useDispatch();
	const dispatchRecordTracksEvent = ( name ) => dispatch( recordTracksEvent( name ) );

	const applySiteOffset = useApplySiteOffset();
	const moment = useLocalizedMoment();

	const today = applySiteOffset?.( moment() );

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const firstKnownBackupAttempt = useFirstKnownBackupAttempt( siteId );
	const oldestDateAvailable = ! firstKnownBackupAttempt.backupAttempt
		? undefined
		: applySiteOffset?.( firstKnownBackupAttempt.backupAttempt.activityTs );

	if ( ! applySiteOffset ) {
		return null;
	}

	return (
		<BackupDatePicker
			siteId={ siteId }
			siteSlug={ siteSlug }
			today={ today }
			selectedDate={ selectedDate }
			oldestDateAvailable={ oldestDateAvailable }
			onDateChange={ onSelectDate }
			dispatchRecordTracksEvent={ dispatchRecordTracksEvent }
		/>
	);
};

export default DatePicker;
