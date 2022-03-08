import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { createTransientMedia } from 'calypso/lib/media/utils';
import wp from 'calypso/lib/wp';
import { gutenframeUpdateImageBlocks } from 'calypso/state/media/thunks';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

const updateMediaItemForPaginatedQuery = ( item ) => ( data ) => {
	if ( ! data || ! Array.isArray( data.pages ) ) {
		return data;
	}
	const pages = data.pages.map( ( { media, ...rest } ) => ( {
		media: media.map( ( mediaItem ) => ( mediaItem.ID === item.ID ? item : mediaItem ) ),
		...rest,
	} ) );
	return { ...data, pages };
};

export function useEditMediaMutation( queryOptions ) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		( { siteId, mediaId, payload } ) =>
			wp.req.post( {
				path: `/sites/${ siteId }/media/${ mediaId }/edit`,
				formData: Object.entries( payload ),
			} ),
		{
			...queryOptions,
			onSuccess( ...args ) {
				const [ editedMediaItem, { siteId } ] = args;

				queryClient.setQueriesData(
					[ 'media', siteId ],
					updateMediaItemForPaginatedQuery( editedMediaItem )
				);

				queryOptions.onSuccess?.( ...args );
			},
			onError( ...args ) {
				const [ , { originalMediaItem, siteId } ] = args;

				queryClient.setQueriesData(
					[ 'media', siteId ],
					updateMediaItemForPaginatedQuery( originalMediaItem )
				);

				queryOptions.onError?.( ...args );
			},
		}
	);

	const { mutate } = mutation;

	const editMedia = useCallback(
		( siteId, item, originalMediaItem ) => {
			const { ID: mediaId, ...payload } = item;
			const transientMediaItem = createTransientMedia( item.media || item.media_url );

			if ( ! transientMediaItem ) {
				return;
			}

			const editedMediaItem = {
				...originalMediaItem,
				...transientMediaItem,
				ID: mediaId,
				isDirty: true,
			};

			queryClient.setQueriesData(
				[ 'media', siteId ],
				updateMediaItemForPaginatedQuery( editedMediaItem )
			);

			if ( originalMediaItem ) {
				mutate( { siteId, mediaId, payload, originalMediaItem } );
			}
		},
		[ mutate, queryClient ]
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
			onSuccess( editedMediaItem ) {
				dispatch( gutenframeUpdateImageBlocks( editedMediaItem, 'updated' ) );
			},
			onError( error, { originalMediaItem } ) {
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
