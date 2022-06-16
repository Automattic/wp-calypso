import { useCallback } from 'react';
import { getFileUploader } from 'calypso/lib/media/utils';
import { isFileList } from 'calypso/state/media/utils/is-file-list';
import { useUploadMediaMutation } from './use-upload-media-mutation';

export const useAddMedia = () => {
	const { uploadMediaAsync } = useUploadMediaMutation();
	const addVideopressStatusToFile = ( file, site ) => {
		const isSiteJetpack = !! site.jetpack;
		const isVideoPressEnabled = site.options && site.options.videopress_enabled;
		const isVideoPressModuleActive =
			! isSiteJetpack ||
			( site.options.active_modules && site.options.active_modules.includes( 'videopress' ) );
		const canUseVideopress = isVideoPressEnabled || isVideoPressModuleActive;

		const fileCallback = ( fileObject ) => {
			fileObject.canUseVideopress = canUseVideopress;
		};

		if ( isFileList( file ) ) {
			Array.from( file ).forEach( fileCallback );
		} else if ( Array.isArray( file ) ) {
			file.forEach( fileCallback );
		} else if ( 'object' === typeof file ) {
			fileCallback( file );
		}

		return file;
	};

	const addMedia = useCallback(
		( file, site, postId ) => {
			return uploadMediaAsync(
				addVideopressStatusToFile( file, site ),
				site,
				postId,
				getFileUploader
			);
		},
		[ uploadMediaAsync ]
	);
	return addMedia;
};
