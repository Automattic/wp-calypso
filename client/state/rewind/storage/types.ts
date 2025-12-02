export type StorageUsageLevelName =
	| 'Full'
	| 'Critical'
	| 'Warning'
	| 'Normal'
	| 'BackupsDiscarded'
	| 'FullButForecastOk';
export const StorageUsageLevels: Record< StorageUsageLevelName, StorageUsageLevelName > = {
	Full: 'Full',
	Critical: 'Critical',
	Warning: 'Warning',
	Normal: 'Normal',
	BackupsDiscarded: 'BackupsDiscarded',
	FullButForecastOk: 'FullButForecastOk',
} as const;
