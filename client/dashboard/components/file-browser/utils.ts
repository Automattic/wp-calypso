import {
	BackupLsResponse,
	BackupLsResponseContents,
	BackupPathInfoResponse,
	FileBrowserItem,
	FileBrowserItemInfo,
	FileType,
} from './types';

const extensionToFileType: Record< string, FileType > = {
	jpg: 'image',
	jpeg: 'image',
	gif: 'image',
	ico: 'image',
	png: 'image',
	webp: 'image',
	svg: 'image',
	mp4: 'video',
	ogg: 'video',
	ogv: 'video',
	webm: 'video',
	avi: 'video',
	mp3: 'audio',
	aac: 'audio',
	pdf: 'text',
	md: 'text',
	txt: 'text',
	eot: 'fonts',
	woff: 'fonts',
	ttf: 'fonts',
	mo: 'translations',
	po: 'translations',
	pot: 'translations',
	html: 'code',
	php: 'code',
	css: 'code',
	js: 'code',
	scss: 'code',
	sass: 'code',
	less: 'code',
	crt: 'code',
};

const getFileExtension = ( filename: string ): string => {
	const lastDotIndex = filename.lastIndexOf( '.' );
	return lastDotIndex !== -1 ? filename.slice( lastDotIndex + 1 ).toLowerCase() : '';
};

export const getFileTypeByExtension = ( filename: string ): FileType | null => {
	const extension = getFileExtension( filename ) || '';
	return extensionToFileType[ extension ] || null;
};

export const transformFileType = (
	name: string,
	item: BackupLsResponseContents[ string ]
): FileType => {
	switch ( item.type ) {
		case 'dir':
		case 'wordpress':
		case 'theme':
		case 'plugin':
		case 'table':
		case 'archive':
			return item.type;
		case 'file':
			if ( item.has_children ) {
				return 'dir';
			}
			return getFileTypeByExtension( name ) ?? 'other';
		default:
			return 'other';
	}
};

export const parseBackupContentsData = ( payload: BackupLsResponse ): FileBrowserItem[] => {
	if ( ! payload || ! payload.contents || ! payload.ok ) {
		return [];
	}

	const transformedData = Object.entries( payload.contents ).map( ( [ name, item ] ) => {
		const type = transformFileType( name, item );
		const label = item.label ?? name;

		return {
			name: label,
			type,
			hasChildren: item.has_children ?? false,
			...( item.period && { period: item.period } ),
			...( item.sort && { sort: item.sort } ),
			...( item.type === 'archive' && { extensionType: name.replace( '*', '' ) } ),
			...( item.type === 'table' && { rowCount: item.row_count } ),
			...( item.extension_version && { extensionVersion: item.extension_version } ),
			...( item.manifest_path && { manifestPath: item.manifest_path } ),
			...( item.id && { id: item.id } ),
			...( item.type !== 'wordpress' && { totalItems: item.total_items ?? 1 } ),
		};
	} );

	return transformedData.sort( ( a, b ) => {
		if ( a.sort !== undefined && b.sort !== undefined ) {
			return a.sort - b.sort;
		}

		if ( a.sort !== undefined ) {
			return -1;
		}
		if ( b.sort !== undefined ) {
			return 1;
		}

		if ( a.hasChildren === true && b.hasChildren !== true ) {
			return -1;
		}
		if ( b.hasChildren === true && a.hasChildren !== true ) {
			return 1;
		}

		if ( a.name < b.name ) {
			return -1;
		}
		if ( a.name > b.name ) {
			return 1;
		}

		return a.name.localeCompare( b.name );
	} );
};

export const parseBackupPathInfo = ( payload: BackupPathInfoResponse ): FileBrowserItemInfo => {
	if ( ! payload ) {
		return {};
	}

	const result: FileBrowserItemInfo = {};

	if ( payload.download_url !== undefined ) {
		result.downloadUrl = payload.download_url;
	}

	if ( payload.mtime !== undefined ) {
		result.mtime = payload.mtime;
	}

	if ( payload.size !== undefined ) {
		result.size = Number( payload.size );
	}

	if ( payload.hash !== undefined ) {
		result.hash = payload.hash;
	}

	if ( payload.data_type !== undefined ) {
		result.dataType = Number( payload.data_type );
	}

	if ( payload.manifest_filter !== undefined ) {
		result.manifestFilter = payload.manifest_filter;
	}

	return result;
};

export const convertBytes = (
	bytes: number,
	decimals = 1
): { unitAmount: string; unit: string } => {
	const units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];
	let size = bytes;

	let i = 0;
	while ( size >= 1024 && i < units.length - 1 ) {
		size /= 1024;
		i++;
	}

	return { unitAmount: size.toFixed( decimals ), unit: units[ i ] };
};

export const encodeToBase64 = ( text: string ): string => {
	const encoder = new TextEncoder();
	const charCodes = encoder.encode( text );
	return window.btoa( String.fromCharCode( ...charCodes ) );
};

type TruncatedFileNameResult = [ string, boolean ];

export const useTruncatedFileName = (
	name: string,
	maxLength: number,
	type: FileType
): TruncatedFileNameResult => {
	if ( type === 'archive' ) {
		return [ name, false ];
	}

	const isTruncated = name.length > maxLength;
	const extension = getFileExtension( name ) || '';
	const basename = name.replace( `.${ extension }`, '' );
	const truncatedName = isTruncated
		? `${ basename.slice( 0, maxLength - 3 - extension.length ) }...${ extension }`
		: name;

	return [ truncatedName, isTruncated ];
};
