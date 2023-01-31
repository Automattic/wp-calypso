export type StorageUsageLevelName = 'Full' | 'Critical' | 'Warning' | 'Normal' | 'BackupsDiscarded';
export const StorageUsageLevels: Record< StorageUsageLevelName, StorageUsageLevelName > = {
	Full: 'Full',
	Critical: 'Critical',
	Warning: 'Warning',
	Normal: 'Normal',
	BackupsDiscarded: 'BackupsDiscarded',
} as const;
