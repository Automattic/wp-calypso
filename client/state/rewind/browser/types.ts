export type BackupBrowserItemType = 'file' | 'theme' | 'plugin' | 'table';

export type BackupBrowserItem = {
	id: string;
	path: string;
	type: BackupBrowserItemType;
	ancestors: string[];
	checkState: 'checked' | 'unchecked' | 'mixed';
	childrenLoaded: boolean;
	children: BackupBrowserItem[];
	totalItems: number;
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

export type BackupBrowserSelectedItem = {
	type: BackupBrowserItemType;
	path: string;
};
