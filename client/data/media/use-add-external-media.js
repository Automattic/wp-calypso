import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import { useUploadMediaMutation } from './use-upload-media-mutation';

const getExternalUploader = ( service ) => ( file, siteId, postId = 0 ) =>
	wpcom.req.post( `/sites/${ siteId }/external-media-upload`, {
		external_ids: [ file.guid ],
		service,
		post_id: postId,
	} );

export const useAddExternalMedia = () => {
	const { uploadMediaAsync } = useUploadMediaMutation();

	return useCallback(
		( file, site, postId, service ) => {
			const uploader = getExternalUploader( service );
			return uploadMediaAsync( file, site, postId, uploader );
		},
		[ uploadMediaAsync ]
	);
};
