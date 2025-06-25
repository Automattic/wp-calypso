import { useQueryClient } from '@tanstack/react-query';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteMediaMutation } from 'calypso/data/media/use-delete-media-mutation';
import { deleteMedia as deleteMediaAction } from 'calypso/state/media/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

export const withDeleteMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const queryClient = useQueryClient();
		const dispatch = useDispatch();
		const translate = useTranslate();
		const { mutateAsync } = useDeleteMediaMutation( {
			onSuccess( mediaItem, { siteId } ) {
				dispatch( deleteMediaAction( siteId, mediaItem.ID ) );
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
					queryClient.invalidateQueries( {
						queryKey: [ 'media-storage', siteId ],
					} );
				}
			},
			[ mutateAsync, dispatch, queryClient, translate ]
		);

		return <Wrapped { ...props } deleteMedia={ deleteMedia } />;
	},
	'WithDeleteMedia'
);
