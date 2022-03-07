import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useDeleteMediaMutation } from 'calypso/data/media/use-delete-media-mutation';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

export const withDeleteMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const queryClient = useQueryClient();
		const dispatch = useDispatch();
		const translate = useTranslate();
		const { mutateAsync } = useDeleteMediaMutation( {
			onSuccess( mediaItem, { siteId } ) {
				queryClient.setQueriesData( [ 'media', siteId ], ( data ) => {
					if ( ! data || ! data.pages ) {
						return data;
					}
					const pages = data.pages.map( ( { media, ...rest } ) => {
						const updatedMedia = media.filter( ( item ) => item.ID !== mediaItem.ID );
						return { media: updatedMedia, ...rest };
					} );
					return { ...data, pages };
				} );
				dispatch( gutenframeUpdateImageBlocks( mediaItem, 'deleted' ) );
			},
		} );

		const deleteMedia = useCallback(
			async ( siteId, mediaIds ) => {
				dispatch( removeNotice( `delete-media-notice` ) );

				const promises = await Promise.allSettled(
					mediaIds.map( ( mediaId ) => mutateAsync( { siteId, mediaId } ) )
				);

				if ( promises.some( ( p ) => p.status === 'rejected' ) ) {
					dispatch(
						errorNotice( translate( 'We were unable to delete all of the selected media items.' ), {
							id: `delete-media-notice`,
						} )
					);
				}

				if ( promises.some( ( p ) => p.status === 'fulfilled' ) ) {
					queryClient.invalidateQueries( [ 'media', siteId ] );
					queryClient.invalidateQueries( [ 'media-storage', siteId ] );
				}
			},
			[ mutateAsync, dispatch, queryClient, translate ]
		);

		return <Wrapped { ...props } deleteMedia={ deleteMedia } />;
	},
	'WithDeleteMedia'
);
