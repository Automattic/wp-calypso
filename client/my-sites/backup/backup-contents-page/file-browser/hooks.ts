import { getFileExtension } from 'calypso/lib/media/utils/get-file-extension';
import { FileType } from './types';

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
