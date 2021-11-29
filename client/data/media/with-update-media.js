import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { receiveMedia } from 'calypso/state/media/actions';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { removeNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useUpdateMediaMutation } from './use-update-media-mutation';

export const withUpdateMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const dispatch = useDispatch();
		const translate = useTranslate();
		const siteId = useSelector( getSelectedSiteId );
		const { updateMedia } = useUpdateMediaMutation( siteId, {
			onMutate( { mediaId } ) {
				dispatch( removeNotice( `update-media-notice-${ mediaId }` ) );
			},
			onSuccess( updatedMediaItem ) {
				dispatch( receiveMedia( siteId, updatedMediaItem ) );
				dispatch( gutenframeUpdateImageBlocks( updatedMediaItem, 'updated' ) );
			},
			onError( error, { mediaId } ) {
				dispatch(
					errorNotice( translate( 'We were unable to process this media item.' ), {
						id: `update-media-notice-${ mediaId.ID }`,
					} )
				);
			},
		} );

		return <Wrapped { ...props } updateMedia={ updateMedia } />;
	},
	'WithUpdateMedia'
);
