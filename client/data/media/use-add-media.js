import { useCallback } from 'react';
import { getFileUploader, canUseVideoPress } from 'calypso/lib/media/utils';
import { isFileList } from 'calypso/state/media/utils/is-file-list';
import { useUploadMediaMutation } from './use-upload-media-mutation';

export const useAddMedia = ( apiMetadata ) => {
	const { uploadMediaAsync } = useUploadMediaMutation();
	const addVideopressStatusToFile = ( file, site ) => {
		const siteCanUseVideoPress = canUseVideoPress( site );

		const addVideoPressStatusToFileObject = ( fileObject ) => {
			fileObject.canUseVideoPress = siteCanUseVideoPress;
		};

		if ( isFileList( file ) ) {
			Array.from( file ).forEach( addVideoPressStatusToFileObject );
		} else if ( Array.isArray( file ) ) {
			file.forEach( addVideoPressStatusToFileObject );
		} else if ( 'object' === typeof file ) {
			addVideoPressStatusToFileObject( file );
		}

		return file;
	};

	const addMedia = useCallback(
		( file, site, postId ) => {
			return uploadMediaAsync(
				addVideopressStatusToFile( file, site ),
				site,
				postId,
				getFileUploader,
				apiMetadata
			);
		},
		[ uploadMediaAsync ]
	);
	return addMedia;
};
