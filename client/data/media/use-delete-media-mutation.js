import { useMutation } from 'react-query';
import wp from 'calypso/lib/wp';

export const useDeleteMediaMutation = ( queryOptions = {} ) => {
	return useMutation(
		( { siteId, mediaId } ) => wp.req.post( `/sites/${ siteId }/media/${ mediaId }/delete` ),
		queryOptions
	);
};
