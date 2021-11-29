import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { useDeleteMediaMutation } from 'calypso/data/media/use-delete-media-mutation';
import { deleteMedia as deleteMediaAction } from 'calypso/state/media/actions';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { requestMediaStorage } from 'calypso/state/sites/media-storage/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const withDeleteMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const dispatch = useDispatch();
		const translate = useTranslate();
		const siteId = useSelector( getSelectedSiteId );
		const { deleteMedia } = useDeleteMediaMutation( siteId, {
			onMutate( { mediaId } ) {
				dispatch( removeNotice( `delete-media-notice-${ mediaId }` ) );
			},
			onSuccess( deletedMediaItem ) {
				dispatch( deleteMediaAction( siteId, deletedMediaItem.ID ) );
				dispatch( requestMediaStorage( siteId ) );
				dispatch( gutenframeUpdateImageBlocks( deletedMediaItem, 'deleted' ) );
			},
			onError( error, { mediaId } ) {
				dispatch(
					errorNotice( translate( 'We were unable to delete this media item.' ), {
						id: `delete-media-notice-${ mediaId }`,
					} )
				);
			},
		} );

		return <Wrapped { ...props } deleteMedia={ deleteMedia } />;
	},
	'WithDeleteMedia'
);
