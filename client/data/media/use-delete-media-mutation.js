import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const useDeleteMediaMutation = ( queryOptions = {} ) => {
	return useMutation( {
		...queryOptions,
		mutationFn: ( { siteId, mediaId } ) =>
			wp.req.post( `/sites/${ siteId }/media/${ mediaId }/delete` ),
	} );
};
