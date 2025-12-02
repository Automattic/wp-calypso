import { _n, __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { StorageUsageLevelName, StorageUsageLevels } from 'calypso/state/rewind/storage/types';

const useStorageStatusText = (
	usageLevel: StorageUsageLevelName,
	daysOfBackupsSaved: number,
	minDaysOfBackupsAllowed: number
): string | null => {
	return useMemo( () => {
		switch ( usageLevel ) {
			case StorageUsageLevels.Warning:
				return __(
					'You are close to reaching your storage limit. Once you do, we will delete your oldest backups to make space for new ones.'
				);
			case StorageUsageLevels.Critical:
				return __(
					'You are very close to reaching your storage limit. Once you do, we will delete your oldest backups to make space for new ones.'
				);
			case StorageUsageLevels.Full:
				//@TODO: we can use `_n` for pluralization here
				return sprintf(
					// translators: %(daysOfBackupsSaved)d is a number of days.
					__(
						'You have reached your storage limit with %(daysOfBackupsSaved)d day(s) of backups saved. Backups have been stopped. Please upgrade your storage to resume backups.'
					),
					{ daysOfBackupsSaved }
				);
			case StorageUsageLevels.FullButForecastOk:
				return sprintf(
					// translators: %(daysOfBackupsSaved)d is a number of days.
					_n(
						'You have reached your storage limit with %(daysOfBackupsSaved)d day of backups saved. Your backups are still running, and if your site size stays the same, storage will come back within limits in the next few days as older backups are replaced.',
						'You have reached your storage limit with %(daysOfBackupsSaved)d days of backups saved. Your backups are still running, and if your site size stays the same, storage will come back within limits in the next few days as older backups are replaced.',
						daysOfBackupsSaved
					),
					{ daysOfBackupsSaved }
				);
			case StorageUsageLevels.BackupsDiscarded:
				//@TODO: we can use `_n` for pluralization here
				return sprintf(
					// translators: %(minDaysOfBackupsAllowed)d is a number of days.
					__(
						'We removed your oldest backup(s) to make space for new ones. We will continue to remove old backups as needed, up to the last %(minDaysOfBackupsAllowed)d days.'
					),
					{ minDaysOfBackupsAllowed }
				);
		}

		return null;
	}, [ usageLevel, daysOfBackupsSaved, minDaysOfBackupsAllowed ] );
};

export default useStorageStatusText;
