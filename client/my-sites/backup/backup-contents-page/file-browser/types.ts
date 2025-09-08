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
}

export interface BackupLsResponse {
	ok: boolean;
	error: string;
	contents: BackupLsResponseContents;
}

export interface BackupLsResponseContents {
	[ key: string ]: {
		id?: string;
		type: ApiFileType;
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

// External dependencies that will be provided as props
export interface FileBrowserExternalProps {
	// Site data
	siteId: number;
	siteSlug: string;
	hasCredentials?: boolean;
	isRestoreEnabled: boolean;

	// Tracks analytics callback
	onTrackEvent?: ( eventName: string, properties?: Record< string, unknown > ) => void;

	// Granular download action callback
	onRequestGranularDownload?: (
		siteId: number,
		rewindId: number,
		includePaths: string,
		excludePaths: string
	) => void;
}
