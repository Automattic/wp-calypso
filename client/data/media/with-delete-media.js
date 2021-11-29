import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import wp from 'calypso/lib/wp';
import { deleteMedia as deleteMediaAction } from 'calypso/state/media/actions';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { requestMediaStorage } from 'calypso/state/sites/media-storage/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useDeleteMediaMutation = ( siteId, queryOptions = {} ) => {
	const mutation = useMutation(
		async ( { mediaId } ) => wp.req.post( `/sites/${ siteId }/media/${ mediaId }/delete` ),
		{ ...queryOptions }
	);

	const { mutate } = mutation;

	const deleteMedia = useCallback(
		( items ) => {
			items = Array.isArray( items ) ? items : [ items ];
			const mediaItems = items.filter( ( item ) => typeof item.ID === 'number' );
			mediaItems.forEach( ( item ) => mutate( { mediaId: item.ID } ) );
		},
		[ mutate ]
	);

	return { deleteMedia, ...mutation };
};

const withDeleteMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const dispatch = useDispatch();
		const translate = useTranslate();
		const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
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

export default withDeleteMedia;
