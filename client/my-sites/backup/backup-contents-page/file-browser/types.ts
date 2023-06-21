export type ApiFileType = 'file' | 'dir' | 'wordpress' | 'table' | 'theme' | 'plugin' | 'archive';
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
	| 'archive'
	| 'other';

export interface FileBrowserItem {
	name: string;
	type: FileType;
	hasChildren: boolean;
	period?: string;
	sort?: number;
	children?: FileBrowserItem[];
	extensionVersion?: string;
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
		label?: string;
		extension_version?: string;
	};
}
