import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { useDispatch } from 'react-redux';
import { createTransientMedia } from 'calypso/lib/media/utils';
import wp from 'calypso/lib/wp';
import { editMediaItem, receiveMedia } from 'calypso/state/media/actions';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import getMediaItem from 'calypso/state/selectors/get-media-item';

const startEditMediaItem = ( siteId, item ) => ( dispatch, getState ) => {
	const transientMediaItem = createTransientMedia( item.media || item.media_url );

	if ( ! transientMediaItem ) {
		return;
	}

	const originalMediaItem = getMediaItem( getState(), siteId, item.ID );
	const editedMediaItem = {
		...originalMediaItem,
		...transientMediaItem,
		ID: item.ID,
		isDirty: true,
	};

	dispatch( editMediaItem( siteId, editedMediaItem, item ) );

	return originalMediaItem;
};

export function useEditMediaMutation( queryOptions ) {
	const dispatch = useDispatch();

	const mutation = useMutation(
		( { siteId, mediaId, payload } ) =>
			wp.req.post( {
				path: `/sites/${ siteId }/media/${ mediaId }/edit`,
				formData: Object.entries( payload ),
			} ),
		queryOptions
	);

	const { mutate } = mutation;

	const editMedia = useCallback(
		( siteId, item ) => {
			const { ID: mediaId, ...payload } = item;
			const originalMediaItem = dispatch( startEditMediaItem( siteId, item ) );

			if ( originalMediaItem ) {
				mutate( { siteId, mediaId, payload, originalMediaItem } );
			}
		},
		[ dispatch, mutate ]
	);

	return { ...mutation, editMedia };
}

export const withEditMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const dispatch = useDispatch();
		const translate = useTranslate();
		const { editMedia } = useEditMediaMutation( {
			onMutate( { mediaId } ) {
				dispatch( removeNotice( `update-media-notice-${ mediaId }` ) );
			},
			onSuccess( media, { siteId } ) {
				dispatch( receiveMedia( siteId, media ) );
				dispatch( gutenframeUpdateImageBlocks( media, 'updated' ) );
			},
			onError( error, { siteId, originalMediaItem } ) {
				dispatch( receiveMedia( siteId, originalMediaItem ) );
				dispatch(
					errorNotice( translate( 'We were unable to process this media item.' ), {
						id: `update-media-notice-${ originalMediaItem.ID }`,
					} )
				);
			},
		} );

		return <Wrapped { ...props } editMedia={ editMedia } />;
	},
	'WithEditMedia'
);
