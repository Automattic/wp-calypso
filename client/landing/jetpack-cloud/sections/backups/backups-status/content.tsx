/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { Moment } from 'moment';

/**
 * Internal dependencies
 */
import { IndexedActivities } from './utils';

interface Props {
	indexedLogs: IndexedActivities;
	selectedDate: Moment;
}

const BackupsPageContent: FunctionComponent< Props > = () => (
	<div className="backups-status__content">
		{ /* <div className="backups__last-backup-status">
			<BackupDatePicker
				onDateChange={ this.onDateChange }
				selectedDate={ this.getSelectedDate() }
				siteId={ siteId }
				oldestDateAvailable={ oldestDateAvailable }
				today={ today }
				siteSlug={ siteSlug }
			/>

			<DailyBackupStatus
				{ ...{
					allowRestore,
					siteUrl,
					siteSlug,
					backup: lastBackup,
					lastDateAvailable,
					selectedDate: this.getSelectedDate(),
					// timezone,
					// gmtOffset,
					hasRealtimeBackups,
					onDateChange: this.onDateChange,
					deltas,
					metaDiff,
				} }
			/>
			{ doesRewindNeedCredentials && (
				<MissingCredentialsWarning settingsLink={ `/settings/${ siteSlug }` } />
			) }
		</div>

		{ hasRealtimeBackups && lastBackup && (
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

export default BackupsPageContent;
