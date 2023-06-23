import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getSubscriberDetailsCacheKey } from '../helpers';
import type { Subscriber } from '../types';

const useSubscriberDetailsQuery = (
	siteId: number | null,
	subscriptionId: number | undefined,
	userId: number | undefined
) => {
	const type = userId ? 'wpcom' : 'email';
	const individualSubscriptionId = userId ?? subscriptionId;

	return useQuery< Subscriber >( {
		queryKey: getSubscriberDetailsCacheKey( siteId, individualSubscriptionId, type ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers/individual?subscription_id=${ individualSubscriptionId }&type=${ type }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscriberDetailsQuery;
