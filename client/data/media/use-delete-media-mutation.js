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
		( siteId, mediaIds ) => mediaIds.forEach( ( mediaId ) => mutate( { siteId, mediaId } ) ),
		[ mutate ]
	);

	return { deleteMedia, ...mutation };
};
