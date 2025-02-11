import { useQueries } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { parseAvatar } from 'calypso/state/stats/lists/utils';
import getDefaultQueryParams from './default-query-params';

const MAX_SUBSCRIBERS_TO_RETURN = 10;

const querySubscribersTotals = (
	siteId: number | null,
	user_type: 'email' | 'wpcom',
	filterAdmin?: boolean
): Promise< any > => {
	return wpcom.req
		.get(
			{
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ siteId }/subscribers_by_user_type`,
			},
			{
				per_page: 10,
				page: 1,
				user_type,
				filter_admin: filterAdmin, //not used.
				sort: 'date_subscribed',
			}
		)
		.catch( () => ( {} ) );
};

const queryMore = ( siteId: number | null ): Promise< any > => {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/subscribers/counts`,
	} );
};

const selectSubscribers = ( payload: {
	total: number;
	total_email: number;
	total_wpcom: number;
	is_owner_subscribing: boolean;
	subscribers: {
		date_subscribed: string;
		display_name: string;
		avatar: string;
		url: string;
		follow_data: { params: object }; //Empty object atm
	}[];
} ) => {
	return {
		total: payload.total,
		total_email: payload.total_email,
		total_wpcom: payload.total_wpcom,
		is_owner_subscribing: payload.is_owner_subscribing,
		subscribers: payload.subscribers?.map( ( item ) => {
			return {
				label: item.display_name,
				iconClassName: 'avatar-user',
				icon: parseAvatar( item.avatar ),
				link: item.url,
				value: {
					type: 'relative-date',
					value: item.date_subscribed,
				},
				actions: [
					{
						type: 'follow',
						data: item.follow_data ? item.follow_data.params : false,
					},
				],
				date_subscribed: item.date_subscribed,
			};
		} ),
	};
};

// email_subscribers includes both email and wpcom subscribers so it can't be used for calculations
const selectPaidSubscribers = ( payload: {
	counts: {
		email_subscribers: number;
		paid_subscribers: number;
		social_followers: number;
	};
} ) => {
	return {
		email_subscribers: payload?.counts?.email_subscribers,
		paid_subscribers: payload?.counts?.paid_subscribers,
		social_followers: payload?.counts?.social_followers,
	};
};

export function useSubscribersTotalsWithoutAdminQueries( siteId: number | null ) {
	return useSubscribersTotalsQueries( siteId, true );
}

function useSubscribersTotalsQueries( siteId: number | null, filterAdmin?: boolean ) {
	const queries = useQueries( {
		queries: [
			{
				...getDefaultQueryParams(),
				queryKey: [ 'stats', 'totals', 'subscribers', 'email', siteId, filterAdmin ],
				queryFn: () => querySubscribersTotals( siteId, 'email', filterAdmin ),
				select: selectSubscribers,
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
			{
				...getDefaultQueryParams(),
				queryKey: [ 'stats', 'totals', 'paid', 'subscribers', siteId ],
				queryFn: () => queryMore( siteId ),
				select: selectPaidSubscribers,
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
			{
				...getDefaultQueryParams(),
				queryKey: [ 'stats', 'totals', 'subscribers', 'wpcom', siteId, filterAdmin ],
				queryFn: () => querySubscribersTotals( siteId, 'wpcom', filterAdmin ),
				select: selectSubscribers,
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		],
	} );

	return {
		data: {
			total_email: queries[ 0 ]?.data?.total,
			total_wpcom: queries[ 2 ]?.data?.total,
			total: queries[ 1 ].data?.email_subscribers,
			paid_subscribers: queries[ 1 ]?.data?.paid_subscribers,
			free_subscribers:
				queries[ 1 ]?.data?.email_subscribers !== undefined &&
				queries[ 1 ]?.data?.paid_subscribers !== undefined
					? queries[ 1 ].data.email_subscribers - queries[ 1 ].data.paid_subscribers
					: null,
			social_followers: queries[ 1 ]?.data?.social_followers,
			is_owner_subscribing: queries[ 2 ]?.data?.is_owner_subscribing,
			// Merge email and wpcom subscribers and sort by date_subscribed, and only shows the most recent 10 subscribers.
			subscribers:
				[
					...( queries[ 0 ]?.data?.subscribers ?? [] ),
					...( queries[ 2 ]?.data?.subscribers ?? [] ),
				]
					.sort( ( a, b ) => {
						return (
							new Date( b.date_subscribed ).getTime() - new Date( a.date_subscribed ).getTime()
						);
					} )
					.slice( 0, MAX_SUBSCRIBERS_TO_RETURN ) ?? [],
		},
		isLoading: queries.some( ( result ) => result.isLoading ),
		isError: queries.some( ( result ) => result.isError ),
	};
}

export default useSubscribersTotalsQueries;
