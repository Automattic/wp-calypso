import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { receiveMedia } from 'calypso/state/media/actions';
import { removeNotice, errorNotice } from 'calypso/state/notices/actions';
import { useUpdateMediaMutation } from './use-update-media-mutation';

export const withUpdateMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const dispatch = useDispatch();
		const translate = useTranslate();
		const { updateMedia } = useUpdateMediaMutation( {
			onMutate( { mediaId } ) {
				dispatch( removeNotice( `update-media-notice-${ mediaId }` ) );
			},
			onSuccess( updatedMediaItem, { siteId } ) {
				dispatch( receiveMedia( siteId, updatedMediaItem ) );
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
