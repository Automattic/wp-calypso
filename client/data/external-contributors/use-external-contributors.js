import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const useExternalContributorsQuery = ( siteId, queryOptions = {} ) => {
	return useQuery(
		[ 'external-contributors', siteId ],
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/external-contributors`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			// The external contributors endpoint can be a little slow, so don't
			// retry too soon if it is taking a while.
			retryDelay: 2000,
			staleTime: 1000 * 60 * 3, // 3 minutes
			...queryOptions,
		}
	);
};

export default useExternalContributorsQuery;
