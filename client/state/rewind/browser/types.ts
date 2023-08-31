export type BackupBrowserItem = {
	path: string;
	ancestors: string[];
	checkState: 'checked' | 'unchecked' | 'mixed';
	childrenLoaded: boolean;
	children: BackupBrowserItem[];
};

export type BackupBrowserItemCheckList = {
	totalItems: number;
	includeList: string[];
	excludeList: string[];
};
