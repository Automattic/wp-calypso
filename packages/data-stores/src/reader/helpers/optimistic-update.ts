import { QueryClient } from '@tanstack/react-query';
import { SiteSubscriptionDetails } from '../types';
import { buildQueryKey } from './index';

type SiteSubScriptionDetailsParameters = {
	blogId: string;
	subscriptionId: string;
	isLoggedIn: boolean;
	id?: number;
};

type CacheKey = ( string | number | boolean | undefined )[];

type PreviousData = {
	key: CacheKey;
	data: SiteSubscriptionDetails;
};

type UpdateFn = ( previousData: SiteSubscriptionDetails ) => SiteSubscriptionDetails;

const alterSiteSubscriptionDetails = async (
	queryClient: QueryClient,
	{ blogId, subscriptionId, isLoggedIn, id }: SiteSubScriptionDetailsParameters,
	updater: UpdateFn
) => {
	const keys: CacheKey[] = [];
	const previousData: PreviousData[] = [];

	keys.push(
		buildQueryKey( [ 'read', 'site-subscription-details', String( blogId ), '' ], isLoggedIn, id )
	);

	keys.push(
		buildQueryKey(
			[ 'read', 'site-subscription-details', String( blogId ), String( subscriptionId ) ],
			isLoggedIn,
			id
		)
	);

	keys.push(
		buildQueryKey(
			[ 'read', 'site-subscription-details', '', String( subscriptionId ) ],
			isLoggedIn,
			id
		)
	);

	keys.push( [ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ] );

	for ( const key of keys ) {
		await queryClient.cancelQueries( key );

		const previousDataForKey = queryClient.getQueryData< SiteSubscriptionDetails >( key );
		if ( previousDataForKey ) {
			previousData.push( { key, data: previousDataForKey } );
			const updatedData = updater( previousDataForKey as SiteSubscriptionDetails );
			queryClient.setQueryData( key, updatedData );
		}
	}

	return previousData;
};

const invalidateSiteSubscriptionDetails = (
	queryClient: QueryClient,
	{ blogId, subscriptionId, isLoggedIn, id }: SiteSubScriptionDetailsParameters
) => {
	queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
	queryClient.invalidateQueries(
		buildQueryKey( [ 'read', 'site-subscription-details', blogId ], isLoggedIn, id )
	);
	queryClient.invalidateQueries(
		buildQueryKey( [ 'read', 'site-subscription-details', blogId, '' ], isLoggedIn, id )
	);
	queryClient.invalidateQueries(
		buildQueryKey( [ 'read', 'site-subscription-details', '', subscriptionId ], isLoggedIn, id )
	);
};

export { alterSiteSubscriptionDetails, invalidateSiteSubscriptionDetails };
