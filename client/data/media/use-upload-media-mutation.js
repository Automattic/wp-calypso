import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useSelectedItems } from 'calypso/my-sites/media/context';
import {
	failMediaItemRequest,
	receiveMedia,
	successMediaItemRequest,
} from 'calypso/state/media/actions';
import { createTransientMediaItems } from 'calypso/state/media/thunks/create-transient-media-items';
import { isFileList } from 'calypso/state/media/utils/is-file-list';

export const useUploadMediaMutation = ( queryOptions = {} ) => {
	const { addToSelectedItems, replaceSelectedMediaItem } = useSelectedItems();
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const mutation = useMutation(
		( { file, siteId, postId, uploader } ) => uploader( file, siteId, postId ),
		{
			onSuccess( { media: [ uploadedMedia ], found }, { siteId, transientMedia } ) {
				const uploadedMediaWithTransientId = {
					...uploadedMedia,
					transientId: transientMedia.ID,
				};

				dispatch( successMediaItemRequest( siteId, transientMedia.ID ) );
				dispatch( receiveMedia( siteId, uploadedMediaWithTransientId, found ) );

				// selectMediaItems(
				// 	selectedItems.map( ( item ) => ( item.ID === transientMedia.ID ? uploadedMedia : item ) )
				// );
				replaceSelectedMediaItem( transientMedia.ID, uploadedMedia );

				queryClient.setQueriesData( [ 'media', siteId ], ( data ) => {
					if ( ! data || ! data.pages ) {
						return data;
					}

					const [ firstPage, ...otherPages ] = data.pages;

					return {
						...data,
						pages: [
							{ ...firstPage, media: [ uploadedMediaWithTransientId, ...firstPage.media ] },
							...otherPages,
						],
					};
				} );

				queryClient.invalidateQueries( [ 'media-storage', siteId ] );
			},
			onError( error, { siteId, transientMedia } ) {
				dispatch( failMediaItemRequest( siteId, transientMedia.ID, error ) );
			},
			...queryOptions,
		}
	);

	const { mutateAsync } = mutation;

	const uploadMediaAsync = useCallback(
		async ( files, site, postId, uploader ) => {
			// https://stackoverflow.com/questions/25333488/why-isnt-the-filelist-object-an-array
			if ( isFileList( files ) ) {
				files = Array.from( files );
			} else if ( ! Array.isArray( files ) ) {
				files = [ files ];
			}

			const uploadedItems = [];

			const uploads = dispatch( createTransientMediaItems( files, site ) );

			addToSelectedItems( uploads.map( ( [ , transientMedia ] ) => transientMedia ) );

			const { ID: siteId } = site;

			for await ( const [ file, transientMedia ] of uploads ) {
				if ( ! transientMedia ) {
					// there was an error creating the transient media so just move on to the next one
					continue;
				}

				const response = await mutateAsync( { file, siteId, postId, uploader, transientMedia } );

				uploadedItems.push( response.media[ 0 ] );
			}

			return uploadedItems;
		},
		[ mutateAsync, dispatch, addToSelectedItems ]
	);

	return { ...mutation, uploadMediaAsync };
};
