export type BackupBrowserItem = {
	id: string;
	path: string;
	ancestors: string[];
	checkState: 'checked' | 'unchecked' | 'mixed';
	childrenLoaded: boolean;
	children: BackupBrowserItem[];
};

export type BackupBrowserCheckListInfo = {
	id: string;
	path: string;
};

export type BackupBrowserItemCheckList = {
	totalItems: number;
	includeList: BackupBrowserCheckListInfo[];
	excludeList: BackupBrowserCheckListInfo[];
};
