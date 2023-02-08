import { StorageUsageLevelName, StorageUsageLevels } from 'calypso/state/rewind/storage/types';

const THRESHOLDS: Record< number, StorageUsageLevelName > = {
	100: StorageUsageLevels.Full,
	80: StorageUsageLevels.Critical,
	65: StorageUsageLevels.Warning,
	0: StorageUsageLevels.Normal,
};
const THRESHOLD_VALUES = Object.keys( THRESHOLDS )
	.map( Number )
	// Sorting from highest to lowest is important for getUsageLevel,
	// because it looks at the elements *in order*.
	.sort( ( a, b ) => b - a );

export const getUsageLevel = (
	used: number | undefined,
	available: number | undefined,
	minDaysOfBackupsAllowed: number,
	daysOfBackupsAllowed: number,
	retentionDays: number,
	daysOfBackupsSaved: number
): StorageUsageLevelName | null => {
	if ( available === undefined || used === undefined ) {
		return null;
	}

	if (
		!! minDaysOfBackupsAllowed &&
		!! daysOfBackupsAllowed &&
		!! retentionDays &&
		!! daysOfBackupsSaved
	) {
		// if current days of backups saved is less than or equal to the minimum and storage is overlimit.
		if (
			minDaysOfBackupsAllowed >= daysOfBackupsSaved &&
			used > 0 &&
			available > 0 &&
			used >= available
		) {
			return StorageUsageLevels.Full;
		}

		// if current allowed days of backups is less than plan's retention days, that means
		// we discarded some backups to make other fit in current storage limit.
		if ( daysOfBackupsAllowed < retentionDays ) {
			return StorageUsageLevels.BackupsDiscarded;
		}
	}

	// Guard against divide-by-zero
	if ( 0 === available ) {
		return StorageUsageLevels.Normal;
	}

	const percentUsed = ( 100 * used ) / available;
	const thresholdValue = THRESHOLD_VALUES.find( ( value ) => percentUsed >= value ) ?? 0;
	return THRESHOLDS[ thresholdValue ];
};
