import { getFileExtension } from 'calypso/lib/media/utils/get-file-extension';
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

/**
 * Converts a BackupPathInfoResponse object into a FileBrowserItemInfo object.
 *
 * The function maps properties from the payload to the returned object,
 * converting property names from snake_case to camelCase, and omitting any
 * properties in the payload that are undefined. If the payload is null or
 * undefined, it returns an empty object.
 * @param {BackupPathInfoResponse} payload - The object to convert.
 * @returns {FileBrowserItemInfo} The converted object.
 */
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

/**
 * Converts a byte value into a more human-readable format, using the appropriate unit (B, KB, MB, GB, TB).
 *
 * The function starts with the byte unit and progressively divides the size by 1024,
 * shifting to the next unit each time, until the size is below 1024 or the unit is TB.
 * The size is rounded to the specified number of decimal places.
 * @param {number} bytes - The size in bytes to convert.
 * @param {number} [decimals] - The number of decimal places to round the size to. Default is 1.
 * @returns {Object} An object containing the size in the new unit, and the unit itself.
 */
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

/**
 * Encodes a given text string to Base64 format.
 *
 * The function employs the TextEncoder to convert the input text into a UTF-8 byte sequence. This step ensures
 * accurate encoding of multibyte characters, which are prevalent in scripts like Japanese and Chinese. Directly
 * using window.btoa on such characters without UTF-8 encoding can lead to incorrect results, as btoa is designed
 * for ASCII strings. By first encoding to UTF-8, we ensure a consistent and accurate Base64 representation for
 * a wide range of texts.
 * @param {string} text - The text string to be encoded, potentially including non-ASCII characters.
 * @returns {string} The Base64 encoded representation of the input text.
 */
export const encodeToBase64 = ( text: string ): string => {
	const encoder = new TextEncoder();
	const charCodes = encoder.encode( text );
	return window.btoa( String.fromCharCode( ...charCodes ) );
};
