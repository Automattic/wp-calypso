import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useDeleteMediaMutation } from 'calypso/data/media/use-delete-media-mutation';
import { deleteMedia as deleteMediaAction } from 'calypso/state/media/actions';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

export const withDeleteMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const queryClient = useQueryClient();
		const dispatch = useDispatch();
		const translate = useTranslate();
		const { mutateAsync } = useDeleteMediaMutation( {
			onSuccess( mediaItem, { siteId } ) {
				dispatch( deleteMediaAction( siteId, mediaItem.ID ) );
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
					queryClient.invalidateQueries( [ 'media-storage', siteId ] );
				}
			},
			[ mutateAsync, dispatch, queryClient, translate ]
		);

		return <Wrapped { ...props } deleteMedia={ deleteMedia } />;
	},
	'WithDeleteMedia'
);
