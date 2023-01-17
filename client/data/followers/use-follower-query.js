import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const useFollowerQuery = ( siteId, subscriberId, type ) => {
	return useQuery( [ 'subscriber', subscriberId, type ], () =>
		wpcom.req.get( {
			path: `/sites/${ siteId }/followers/${ subscriberId }?type=${ type }&http_envelope=1`,
			apiNamespace: 'rest/v1.1',
		} )
	);
};

export default useFollowerQuery;
