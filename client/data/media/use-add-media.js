import { createHigherOrderComponent } from '@wordpress/compose';
import { useCallback } from 'react';
import { getFileUploader } from 'calypso/lib/media/utils';
import { useUploadMediaMutation } from './use-upload-media-mutation';

export const useAddMedia = () => {
	const { uploadMediaAsync } = useUploadMediaMutation();
	const addMedia = useCallback(
		( file, site, postId ) => {
			return uploadMediaAsync( file, site, postId, getFileUploader );
		},
		[ uploadMediaAsync ]
	);
	return addMedia;
};

export const withAddMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const addMedia = useAddMedia();
		return <Wrapped { ...props } addMedia={ addMedia } />;
	},
	'WithAddMedia'
);
