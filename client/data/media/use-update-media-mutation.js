import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

export const useUpdateMediaMutation = ( queryOptions = {} ) => {
	const mutation = useMutation( {
		...queryOptions,
		mutationFn: ( { siteId, mediaId, updates } ) =>
			wp.req.post( `/sites/${ siteId }/media/${ mediaId }`, updates ),
	} );

	const { mutate } = mutation;

	const updateMedia = useCallback(
		( siteId, mediaId, updates ) => mutate( { siteId, mediaId, updates } ),
		[ mutate ]
	);

	return { updateMedia, ...mutation };
};
