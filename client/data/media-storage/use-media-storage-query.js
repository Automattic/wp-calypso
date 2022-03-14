import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

function useMediaStorageQuery( siteId, queryOptions = {} ) {
	return useQuery(
		[ 'media-storage', siteId ],
		() => wp.req.get( `/sites/${ siteId }/media-storage` ),
		{
			...queryOptions,
			enabled: !! siteId,
		}
	);
}

export default useMediaStorageQuery;
