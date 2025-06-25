import { keepPreviousData, useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getSubscriberDetailsCacheKey, getSubscriberDetailsType } from '../helpers';
import type { SubscriberDetails } from '../types';

const useSubscriberDetailsQuery = (
	siteId: number | null,
	subscriptionId: number | undefined,
	userId: number | undefined
) => {
	const type = getSubscriberDetailsType( userId );

	return useQuery< SubscriberDetails >( {
		queryKey: getSubscriberDetailsCacheKey( siteId, subscriptionId, userId, type ),
		queryFn: () =>
			wpcom.req.get( {
				path: userId
					? `/sites/${ siteId }/subscribers/individual?user_id=${ userId }&type=${ type }`
					: `/sites/${ siteId }/subscribers/individual?subscription_id=${ subscriptionId }&type=${ type }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && ( !! subscriptionId || !! userId ),
		placeholderData: keepPreviousData,
	} );
};

export default useSubscriberDetailsQuery;
