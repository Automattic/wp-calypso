import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const useViewerQuery = ( siteId, userId ) => {
	return useQuery( {
		queryKey: [ 'viewer', userId ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/viewer/${ userId }?http_envelope=1`,
				apiNamespace: 'rest/v1.1',
			} ),
	} );
};

export default useViewerQuery;
