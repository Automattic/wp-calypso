export type FileBrowserNodeType =
	| 'file'
	| 'dir'
	| 'wordpress'
	| 'table'
	| 'theme'
	| 'plugin'
	| 'archive';

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
	id?: string;
	name: string;
	type: FileType;
	hasChildren: boolean;
	period?: string;
	sort?: number;
	rowCount?: number;
	children?: FileBrowserItem[];
	extensionVersion?: string;
	manifestPath?: string;
	extensionType?: string;
	totalItems?: number;
	path?: string;
}

export interface BackupLsResponse {
	ok: boolean;
	error: string;
	contents: BackupLsResponseContents;
}

export interface BackupLsResponseContents {
	[ key: string ]: {
		id?: string;
		type: FileBrowserNodeType;
		has_children: boolean;
		period?: string;
		sort?: number;
		manifest_path?: string;
		label?: string;
		row_count?: number;
		extension_version?: string;
		total_items?: number;
	};
}

// Data type for the response from the backup/path-info endpoint
export interface BackupPathInfoResponse {
	download_url?: string;
	mtime?: number;
	size?: number;
	hash?: string;
	data_type?: number;
	manifest_filter?: string;
	error?: string;
}

export interface FileBrowserItemInfo {
	downloadUrl?: string;
	mtime?: number;
	size?: number;
	hash?: string;
	dataType?: number;
	manifestFilter?: string;
}

export type FileBrowserCheckState = 'checked' | 'unchecked' | 'mixed';

export interface FileBrowserNode {
	id: string;
	path: string;
	type: FileBrowserNodeType;
	ancestors: string[];
	checkState: FileBrowserCheckState;
	childrenLoaded: boolean;
	children: FileBrowserNode[];
	totalItems: number;
}

export interface FileBrowserCheckListInfo {
	id: string;
	path: string;
	type?: FileBrowserNodeType;
}

export interface FileBrowserNodeCheckList {
	totalItems: number;
	includeList: FileBrowserCheckListInfo[];
	excludeList: FileBrowserCheckListInfo[];
}

export interface FileBrowserState {
	rootNode: FileBrowserNode;
}

export interface FileBrowserStateActions {
	getNode: ( path: string, rewindId: number ) => FileBrowserNode | null;
	getCheckList: ( rewindId: number ) => FileBrowserNodeCheckList;
	getSelectedList: ( rewindId: number ) => FileBrowserCheckListInfo[];
	setNodeCheckState: (
		nodePath: string,
		checkState: FileBrowserCheckState,
		rewindId: number
	) => void;
	addChildNodes: ( parentPath: string, childrenPaths: FileBrowserItem[], rewindId: number ) => void;
}
