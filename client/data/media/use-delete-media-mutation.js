import { useCallback } from 'react';
import { useMutation } from 'react-query';
import wp from 'calypso/lib/wp';

export const useDeleteMediaMutation = ( siteId, queryOptions = {} ) => {
	const mutation = useMutation(
		async ( { mediaId } ) => wp.req.post( `/sites/${ siteId }/media/${ mediaId }/delete` ),
		{ ...queryOptions }
	);

	const { mutate } = mutation;

	const deleteMedia = useCallback(
		( items ) => {
			items = Array.isArray( items ) ? items : [ items ];
			items
				.filter( ( item ) => typeof item.ID === 'number' )
				.forEach( ( item ) => mutate( { mediaId: item.ID } ) );
		},
		[ mutate ]
	);

	return { deleteMedia, ...mutation };
};
