export enum StorageUsageLevels {
	Full = 100,
	Critical = 80,
	Warning = 65,
	Normal = 0,
}

// Transform the enum so we can iterate more easily,
// sorting levels from highest to lowest.
//
// This ordering is important for getUsageLevel,
// because it looks at the elements *in order*.
const levelsArray: StorageUsageLevels[] = Object.values( StorageUsageLevels )
	// Get only numeric values, ignoring the enum keys (which are also stored as values)
	.filter( Number.isInteger )
	.sort( ( a, b ) => ( b as number ) - ( a as number ) )
	.map( ( val ) => val as StorageUsageLevels );

export const getUsageLevel = (
	used: number | undefined,
	available: number | undefined
): StorageUsageLevels | null => {
	if ( available === undefined || used === undefined ) {
		return null;
	}

	// Guard against divide-by-zero
	if ( available === 0 ) {
		return StorageUsageLevels.Normal;
	}

	const percentUsed = ( 100 * used ) / available;
	return levelsArray.find( ( level ) => percentUsed >= level ) ?? StorageUsageLevels.Normal;
};
