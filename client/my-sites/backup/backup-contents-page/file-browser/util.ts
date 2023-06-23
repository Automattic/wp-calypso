import { getFileExtension } from 'calypso/lib/media/utils/get-file-extension';
import { BackupLsResponse, BackupLsResponseContents, FileBrowserItem, FileType } from './types';

const extensionToFileType: Record< string, FileType > = {
	jpg: 'image',
	jpeg: 'image',
	gif: 'image',
	ico: 'image',
	png: 'image',
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

export const getFileTypeByExtension = ( filename: string ): FileType | null => {
	const extension = getFileExtension( filename ) || '';

	// return the file type corresponding to the extension or null if it's not found
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
			...( item.type === 'archive' && { extension_type: name.replace( '*', '' ) } ),
			...( item.extension_version && { extensionVersion: item.extension_version } ),
		};
	} );

	return transformedData.sort( ( a, b ) => {
		if ( a.sort !== undefined && b.sort !== undefined ) {
			return a.sort - b.sort;
		}

		// If only one has 'sort', that comes first
		if ( a.sort !== undefined ) {
			return -1;
		}
		if ( b.sort !== undefined ) {
			return 1;
		}

		// If 'sort' field doesn't exist in either, then 'dir' types come first
		if ( a.hasChildren === true && b.hasChildren !== true ) {
			return -1;
		}
		if ( b.hasChildren === true && a.hasChildren !== true ) {
			return 1;
		}

		// If neither has 'sort' nor is 'dir', sort based on 'name'.
		if ( a.name < b.name ) {
			return -1;
		}
		if ( a.name > b.name ) {
			return 1;
		}

		// If types are the same, sort by name
		return a.name.localeCompare( b.name );
	} );
};
