import { useCallback } from 'react';
import { useMutation } from 'react-query';
import wp from 'calypso/lib/wp';

export const useUpdateMediaMutation = ( siteId, queryOptions = {} ) => {
	const mutation = useMutation(
		( { mediaId, updates } ) => wp.req.post( `/sites/${ siteId }/media/${ mediaId }`, updates ),
		{ ...queryOptions }
	);

	const { mutate } = mutation;

	const updateMedia = useCallback( ( mediaId, updates ) => mutate( { mediaId, updates } ), [
		mutate,
	] );

	return { updateMedia, ...mutation };
};
