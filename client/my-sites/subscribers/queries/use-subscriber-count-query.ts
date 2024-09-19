import { keepPreviousData, useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface SubscribersTotals {
	email_subscribers: number;
	paid_subscribers: number;
	social_followers: number;
}

export const defaultSubscribersTotals = {
	email_subscribers: 0,
	paid_subscribers: 0,
	social_followers: 0,
};

const getSubscriberCount = ( siteId: number | null ): Promise< any > => {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/subscribers/counts`,
	} );
};

export default function useSubscriberCountQuery( siteId: number | null ) {
	return useQuery< SubscribersTotals >( {
		queryKey: [ 'subscribers', 'count', siteId ],
		queryFn: () => {
			return getSubscriberCount( siteId ).then( ( response ) => {
				return response.counts || defaultSubscribersTotals;
			} );
		},
		enabled: !! siteId,
		placeholderData: keepPreviousData,
	} );
}
