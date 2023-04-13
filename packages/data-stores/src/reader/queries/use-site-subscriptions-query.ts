import { useQuery } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SiteSubscription } from '../types';

type SubscriptionManagerSiteSubscriptions = {
	subscriptions: SiteSubscription[];
	page: number;
	total_subscriptions: number;
};

type SubscriptionManagerSiteSubscriptionsQueryProps = {
	filter?: ( item?: SiteSubscription ) => boolean;
	sort?: ( a?: SiteSubscription, b?: SiteSubscription ) => number;
	number?: number;
};

const callFollowingEndPoint = async (
	page: number,
	number: number,
	isLoggedIn: boolean
): Promise< SiteSubscription[] > => {
	const data = [];

	const incoming = await callApi< SubscriptionManagerSiteSubscriptions >( {
		path: `/read/following/mine?number=${ number }&page=${ page }`,
		isLoggedIn,
		apiVersion: '1.2',
	} );

	if ( incoming && incoming.subscriptions ) {
		data.push(
			...incoming.subscriptions.map( ( subscription ) => ( {
				...subscription,
				last_updated: new Date( subscription.last_updated ),
				date_subscribed: new Date( subscription.date_subscribed ),
			} ) )
		);
	}

	if ( incoming.page * number < incoming.total_subscriptions ) {
		const next = await callFollowingEndPoint( page + 1, number, isLoggedIn );
		data.push( ...next );
	}

	return data;
};

const defaultFilter = () => true;
const defaultSort = () => 0;

const useSiteSubscriptionsQuery = ( {
	filter = defaultFilter,
	sort = defaultSort,
	number = 100,
}: SubscriptionManagerSiteSubscriptionsQueryProps = {} ) => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();

	const { data, ...rest } = useQuery< SiteSubscription[] >(
		[ 'read', 'site-subscriptions', isLoggedIn ],
		async () => {
			return await callFollowingEndPoint( 1, number, isLoggedIn );
		},
		{
			enabled,
			refetchOnWindowFocus: false,
		}
	);

	return {
		data: data?.filter( filter ).sort( sort ),
		...rest,
	};
};

export default useSiteSubscriptionsQuery;
