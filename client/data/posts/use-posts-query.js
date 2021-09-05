import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const getCacheKey = ( siteId, queryId = '' ) => [ 'posts', siteId, queryId ];

const usePostsQuery = ( siteId, queryId, query = {}, queryOptions = {} ) => {
	return useQuery(
		getCacheKey( siteId, queryId ),
		() =>
			wpcom.req.get(
				{
					path: `/sites/${ siteId }/posts`,
					apiNamespace: 'rest/v1.1',
				},
				query
			),
		queryOptions
	);
};

export default usePostsQuery;
