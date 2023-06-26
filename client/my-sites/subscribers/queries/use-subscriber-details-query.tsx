import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getSubscriberDetailsCacheKey } from '../helpers';
import type { Subscriber } from '../types';

const useSubscriberDetailsQuery = (
	siteId: number | null,
	subscriptionId: number | undefined,
	userId: number | undefined
) => {
	let queryString = '';

	if ( userId ) {
		queryString = `user_id=${ userId }&type=wpcom`;
	} else {
		queryString = `subscription_id=${ subscriptionId }&type=email`;
	}

	return useQuery< Subscriber >( {
		queryKey: getSubscriberDetailsCacheKey( siteId, queryString ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers/individual?${ queryString }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscriberDetailsQuery;
