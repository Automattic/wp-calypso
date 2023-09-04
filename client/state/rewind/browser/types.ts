export type BackupBrowserItem = {
	id: string;
	path: string;
	type: 'theme' | 'plugin' | 'table' | 'file';
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

export type BackupBrowserSelectedItem = {
	type: 'theme' | 'plugin' | 'table' | 'file';
	path: string;
};
