import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const useSubscribersQuery = ( siteId: number, page = 1 ) => {
	return useQuery( {
		queryKey: [ 'subscribers', siteId, page ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers?per_page=10&page=${ page }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
	} );
};

export default useSubscribersQuery;
