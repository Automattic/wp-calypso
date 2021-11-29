import { useCallback } from 'react';
import { useMutation } from 'react-query';
import wp from 'calypso/lib/wp';

export const useDeleteMediaMutation = ( siteId, queryOptions = {} ) => {
	const mutation = useMutation(
		( { mediaId } ) => wp.req.post( `/sites/${ siteId }/media/${ mediaId }/delete` ),
		{ ...queryOptions }
	);

	const { mutate } = mutation;

	const deleteMedia = useCallback(
		( items ) => {
			const mediaItems = Array.isArray( items ) ? items : [ items ];
			mediaItems
				.filter( ( item ) => typeof item.ID === 'number' )
				.forEach( ( item ) => mutate( { mediaId: item.ID } ) );
		},
		[ mutate ]
	);

	return { deleteMedia, ...mutation };
};
