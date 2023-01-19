export type StorageUsageLevelName = 'Full' | 'Critical' | 'Warning' | 'Normal' | 'BackupsDiscarded';
export const StorageUsageLevels: Record< StorageUsageLevelName, StorageUsageLevelName > = {
	Full: 'Full',
	Critical: 'Critical',
	Warning: 'Warning',
	Normal: 'Normal',
	BackupsDiscarded: 'BackupsDiscarded',
} as const;

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
	planRetentionDays: number,
	daysOfBackupsSaved: number
): StorageUsageLevelName | null => {
	if ( available === undefined || used === undefined ) {
		return null;
	}

	if (
		!! minDaysOfBackupsAllowed &&
		!! daysOfBackupsAllowed &&
		!! planRetentionDays &&
		!! daysOfBackupsSaved
	) {
		// if current allowed days of backups is equal to the minimum, return storage full.
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
		if ( daysOfBackupsAllowed < planRetentionDays ) {
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
