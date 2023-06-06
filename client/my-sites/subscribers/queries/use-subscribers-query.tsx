import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const useSubscribersQuery = ( siteId: number ) => {
	return useQuery( {
		queryKey: [ 'subscribers', siteId ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers?per_page=10`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
	} );
};

export default useSubscribersQuery;
