import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const useViewerQuery = ( siteId, userId ) => {
	return useQuery( [ 'viewer', userId ], () =>
		wpcom.req.get( {
			path: `/sites/${ siteId }/viewer/${ userId }?http_envelope=1`,
			apiNamespace: 'rest/v1.1',
		} )
	);
};

export default useViewerQuery;
