import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
	failMediaItemRequest,
	receiveMedia,
	successMediaItemRequest,
} from 'calypso/state/media/actions';
import { createTransientMediaItems } from 'calypso/state/media/thunks/create-transient-media-items';
import { isFileList } from 'calypso/state/media/utils/is-file-list';

export const useUploadMediaMutation = ( queryOptions = {} ) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const mutation = useMutation( {
		mutationFn: ( { file, siteId, postId, uploader, apiMetadata } ) =>
			uploader( file, siteId, postId, apiMetadata ),
		onSuccess( { media: [ uploadedMedia ], found }, { siteId, transientMedia } ) {
			const uploadedMediaWithTransientId = {
				...uploadedMedia,
				transientId: transientMedia.ID,
			};

			dispatch( successMediaItemRequest( siteId, transientMedia.ID ) );
			dispatch( receiveMedia( siteId, uploadedMediaWithTransientId, found ) );

			queryClient.invalidateQueries( {
				queryKey: [ 'media-storage', siteId ],
			} );
		},
		onError( error, { siteId, transientMedia } ) {
			dispatch( failMediaItemRequest( siteId, transientMedia.ID, error ) );
		},
		...queryOptions,
	} );

	const { mutateAsync } = mutation;

	const uploadMediaAsync = useCallback(
		async ( files, site, postId, uploader, apiMetadata ) => {
			// https://stackoverflow.com/questions/25333488/why-isnt-the-filelist-object-an-array
			if ( isFileList( files ) ) {
				files = Array.from( files );
			} else if ( ! Array.isArray( files ) ) {
				files = [ files ];
			}

			const uploadedItems = [];
			const transientItems = dispatch( createTransientMediaItems( files, site ) );
			const { ID: siteId } = site;

			const uploads = files.map( ( _, i ) => [ files[ i ], transientItems[ i ] ] );

			for await ( const [ file, transientMedia ] of uploads ) {
				if ( ! transientMedia ) {
					// there was an error creating the transient media so just move on to the next one
					continue;
				}

				const response = await mutateAsync( {
					file,
					siteId,
					postId,
					uploader,
					apiMetadata,
					transientMedia,
				} );

				uploadedItems.push( response.media[ 0 ] );
			}

			return uploadedItems;
		},
		[ mutateAsync, dispatch ]
	);

	return { ...mutation, uploadMediaAsync };
};
