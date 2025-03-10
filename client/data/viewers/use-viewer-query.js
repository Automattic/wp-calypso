import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const useViewerQuery = ( siteId, userId ) => {
	return useQuery( {
		queryKey: [ 'viewer', siteId, userId ],
		queryFn: () => wpcom.req.get( `/sites/${ siteId }/viewer/${ userId }` ),
	} );
};

export default useViewerQuery;
