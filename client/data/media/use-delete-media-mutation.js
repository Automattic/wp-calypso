import { useCallback } from 'react';
import { useMutation } from 'react-query';
import wp from 'calypso/lib/wp';

export const useDeleteMediaMutation = ( queryOptions = {} ) => {
	const mutation = useMutation(
		( { siteId, mediaId } ) => wp.req.post( `/sites/${ siteId }/media/${ mediaId }/delete` ),
		{ ...queryOptions }
	);

	const { mutate } = mutation;

	const deleteMedia = useCallback(
		( siteId, items ) => {
			const mediaItems = Array.isArray( items ) ? items : [ items ];
			mediaItems
				.filter( ( item ) => typeof item.ID === 'number' )
				.forEach( ( item ) => mutate( { siteId, mediaId: item.ID } ) );
		},
		[ mutate ]
	);

	return { deleteMedia, ...mutation };
};
