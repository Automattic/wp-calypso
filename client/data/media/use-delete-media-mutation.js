import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wp from 'calypso/lib/wp';

function useDeleteMediaMutation() {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { siteId, mediaId } ) => wp.req.post( `/sites/${ siteId }/media/${ mediaId }/delete` ),
		{
			onSuccess( data, { siteId } ) {
				queryClient.invalidateQueries( [ 'media', siteId ] );
			},
		}
	);

	const { mutate } = mutation;

	const deleteMedia = useCallback(
		( siteId, mediaItem ) => {
			mutate( { siteId, mediaId: mediaItem.ID } );
		},
		[ mutate ]
	);

	return { deleteMedia, ...mutation };
}

export default useDeleteMediaMutation;
