export type FileType = 'file' | 'dir';

export interface FileBrowserItem {
	name: string;
	type: FileType;
	hasChildren: boolean;
	period?: string;
	children?: FileBrowserItem[];
}

export interface BackupLsResponse {
	ok: boolean;
	error: string;
	contents: BackupLsResponseContents;
}

export interface BackupLsResponseContents {
	[ key: string ]: {
		type: FileType;
		has_children: boolean;
		period?: string;
		manifest_path?: string;
	};
}
