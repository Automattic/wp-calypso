import { useCallback } from 'react';
import { useMutation } from 'react-query';
import wp from 'calypso/lib/wp';

export const useUpdateMediaMutation = ( queryOptions = {} ) => {
	const mutation = useMutation(
		( { siteId, mediaId, updates } ) =>
			wp.req.post( `/sites/${ siteId }/media/${ mediaId }`, updates ),
		queryOptions
	);

	const { mutate } = mutation;

	const updateMedia = useCallback(
		( siteId, mediaId, updates ) => mutate( { siteId, mediaId, updates } ),
		[ mutate ]
	);

	return { updateMedia, ...mutation };
};
