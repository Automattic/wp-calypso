export type StorageUsageLevelName = 'Full' | 'Critical' | 'Warning' | 'Normal';
export const StorageUsageLevels: Record< StorageUsageLevelName, StorageUsageLevelName > = {
	Full: 'Full',
	Critical: 'Critical',
	Warning: 'Warning',
	Normal: 'Normal',
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
	available: number | undefined
): StorageUsageLevelName | null => {
	if ( available === undefined || used === undefined ) {
		return null;
	}

	// Guard against divide-by-zero
	if ( available === 0 ) {
		return StorageUsageLevels.Normal;
	}

	const percentUsed = ( 100 * used ) / available;
	const thresholdValue = THRESHOLD_VALUES.find( ( value ) => percentUsed >= value ) ?? 0;
	return THRESHOLDS[ thresholdValue ];
};
