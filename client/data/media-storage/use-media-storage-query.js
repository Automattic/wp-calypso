import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

function useMediaStorageQuery( siteId, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'media-storage', siteId ],
		queryFn: () => wp.req.get( `/sites/${ siteId }/media-storage` ),
		...queryOptions,
		enabled: !! siteId,
	} );
}

export default useMediaStorageQuery;
