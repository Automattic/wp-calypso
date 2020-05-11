/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import moment, { Moment } from 'moment';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { IndexedActivities } from './utils';
import BackupDatePicker from 'landing/jetpack-cloud/components/backup-date-picker';
// import DailyBackupStatus from 'landing/jetpack-cloud/components/daily-backup-status';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

interface Props {
	indexedLogs: IndexedActivities;
	selectedDate: Moment;
}

const BackupsPageContent: FunctionComponent< Props > = ( {
	selectedDate,
	indexedLogs: { oldestDateAvailable },
} ) => {
	const today = moment();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<div className="backups-status__content">
			<div className="backups-status__last-backup-status">
				<BackupDatePicker
					selectedDate={ selectedDate }
					siteId={ siteId }
					oldestDateAvailable={ oldestDateAvailable }
					today={ today }
					siteSlug={ siteSlug }
				/>

				{ /* <DailyBackupStatus
					{ ...{
						allowRestore,
						siteUrl,
						siteSlug,
						backup: lastBackup,
						lastDateAvailable,
						selectedDate,
						// timezone,
						// gmtOffset,
						hasRealtimeBackups,
						onDateChange: this.onDateChange,
						deltas,
						metaDiff,
					} }
				/> */ }
				{ /* { doesRewindNeedCredentials && (
				<MissingCredentialsWarning settingsLink={ `/settings/${ siteSlug }` } />
			) } */ }
			</div>

			{ /* { hasRealtimeBackups && lastBackup && (
			<BackupDelta
				{ ...{
					deltas,
					realtimeBackups,
					allowRestore,
					// moment,
					siteSlug,
					metaDiff,
				} }
			/>
		) } */ }
		</div>
	);
};

export default BackupsPageContent;
