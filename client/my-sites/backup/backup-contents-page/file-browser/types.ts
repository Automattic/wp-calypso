export type ApiFileType = 'file' | 'dir' | 'wordpress' | 'table' | 'theme' | 'plugin';
export type FileType =
	| 'dir'
	| 'image'
	| 'text'
	| 'plugin'
	| 'theme'
	| 'table'
	| 'audio'
	| 'video'
	| 'fonts'
	| 'translations'
	| 'code'
	| 'wordpress'
	| 'other';

export interface FileBrowserItem {
	name: string;
	type: FileType;
	hasChildren: boolean;
	period?: string;
	sort?: number;
	children?: FileBrowserItem[];
}

export interface BackupLsResponse {
	ok: boolean;
	error: string;
	contents: BackupLsResponseContents;
}

export interface BackupLsResponseContents {
	[ key: string ]: {
		type: ApiFileType;
		has_children: boolean;
		period?: string;
		sort?: number;
		manifest_path?: string;
	};
}
