import config from '@automattic/calypso-config';
import { useQueries } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { parseAvatar } from 'calypso/state/stats/lists/utils';
import getDefaultQueryParams from './default-query-params';

const MAX_SUBSCRIBERS_TO_RETURN = 10;
const isJetpackApi = config.isEnabled( 'is_running_in_jetpack_site' );
const sortByDateDesc = ( a: { date_subscribed: string }, b: { date_subscribed: string } ) => {
	return new Date( b.date_subscribed ).getTime() - new Date( a.date_subscribed ).getTime();
};

/**
 * The `stats/followers` `ID` field is the WordPress.com user id for wpcom subscribers but the
 * subscription id for email-only ones. Treat it as a user id only when it differs from the
 * subscription id, so the Newsletter inspector gets `u` for wpcom rows and omits it for email rows.
 * @param id             The row's `ID` field.
 * @param subscriptionId The resolved subscription id for the same row.
 * @returns The WordPress.com user id, or undefined for email-only rows.
 */
export const getSubscriberUserId = (
	id: number | undefined,
	subscriptionId: number | undefined
): number | undefined => ( id && id !== subscriptionId ? id : undefined );

const querySubscribersTotals = ( siteId: number | null, filterAdmin?: boolean ): Promise< any > => {
	// Skip the query for en.blog.wordpress.com as it's blocked.
	if ( siteId === 3584907 ) {
		return {} as any;
	}
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/stats/followers`,
		},
		{
			type: 'all',
			filter_admin: filterAdmin ? true : false,
			// Only one-page results adjust visible subscribers with deleted accounts to align with the subscriber list.
			max: MAX_SUBSCRIBERS_TO_RETURN,
		}
	);
};

const querySubscribersTotalByType = (
	siteId: number | null,
	user_type: 'email' | 'wpcom',
	filterAdmin?: boolean
): Promise< any > => {
	// Return early to avoid 404.
	if ( isJetpackApi ) {
		return {} as any;
	}
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ siteId }/subscribers_by_user_type`,
		},
		{
			per_page: MAX_SUBSCRIBERS_TO_RETURN,
			page: 1,
			user_type,
			filter_admin: filterAdmin, //not used.
			sort: 'date_subscribed',
		}
	);
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
	is_owner_subscribed: boolean;
	subscribers: {
		label?: string;
		date_subscribed: string;
		display_name: string;
		avatar: string;
		url: string;
		follow_data: { params: object }; //Empty object atm
		email_subscription_id?: number;
		subscription_id?: number;
		wpcom_subscription_id?: number;
		ID?: number;
	}[];
} ) => {
	return {
		total: payload.total,
		total_email: payload.total_email,
		total_wpcom: payload.total_wpcom,
		is_owner_subscribed: payload.is_owner_subscribed,
		subscribers: ( payload.subscribers ?? [] ).map( ( item ) => {
			// Truthy fallback (not `??`) so a `0` placeholder id falls through to the
			// next field, the same approach getSubscriptionIdFromSubscriber takes. Do not
			// fall back to `item.ID`: for wpcom subscribers that is the user id, not a
			// subscription id, so linking by it would open the wrong subscriber. The
			// `stats/followers` endpoint returns a real `subscription_id` (wpcom#224796);
			// a row without one simply doesn't link rather than mis-linking.
			const subscriptionId =
				item.email_subscription_id || item.subscription_id || item.wpcom_subscription_id;
			return {
				label: item.label ?? item.display_name,
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
				// Preserve the subscription id so the Subscribers module can link each
				// name to its individual subscriber details page.
				subscription_id: subscriptionId,
				user_id: getSubscriberUserId( item.ID, subscriptionId ),
			};
		} ),
	};
};

// email_subscribers includes both email and wpcom subscribers so it can't be used for calculations
const selectPaidSubscribers = ( payload: {
	counts: {
		total_subscribers: number;
		email_subscribers: number;
		paid_subscribers: number;
		social_followers: number;
	};
} ) => {
	return {
		total_subscribers: payload?.counts?.total_subscribers,
		email_subscribers: payload?.counts?.email_subscribers,
		paid_subscribers: payload?.counts?.paid_subscribers,
		social_followers: payload?.counts?.social_followers,
	};
};

function useSubscribersTotalsQueries( siteId: number | null, filterAdmin?: boolean ) {
	const results = useQueries( {
		queries: [
			{
				...getDefaultQueryParams(),
				queryKey: [ 'stats', 'totals', 'subscribers', 'all', siteId, filterAdmin ],
				queryFn: () => querySubscribersTotals( siteId, filterAdmin ),
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
				queryFn: () => querySubscribersTotalByType( siteId, 'wpcom', filterAdmin ),
				select: selectSubscribers,
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
			{
				...getDefaultQueryParams(),
				queryKey: [ 'stats', 'totals', 'subscribers', 'email', siteId, filterAdmin ],
				queryFn: () => querySubscribersTotalByType( siteId, 'email', filterAdmin ),
				select: selectSubscribers,
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		],
	} );

	if ( isJetpackApi ) {
		// `subscribers_by_user_type` endpoint is not available for Odyssey Stats yet.
		return {
			data: {
				total_email: results[ 0 ]?.data?.total_email,
				total_wpcom: results[ 0 ]?.data?.total_wpcom,
				total: results[ 1 ]?.data?.total_subscribers,
				paid_subscribers: results[ 1 ]?.data?.paid_subscribers,
				free_subscribers:
					results[ 1 ]?.data?.total_subscribers !== undefined &&
					results[ 1 ]?.data?.paid_subscribers !== undefined
						? results[ 1 ].data.total_subscribers - results[ 1 ].data.paid_subscribers
						: null,
				social_followers: results[ 1 ]?.data?.social_followers,
				is_owner_subscribed: results[ 0 ]?.data?.is_owner_subscribed,
				subscribers: ( results[ 0 ]?.data?.subscribers ?? [] ).sort( sortByDateDesc ),
			},
			isLoading: results.some( ( result ) => result.isPending ),
			isError: results.some( ( result ) => result.isError ),
		};
	}

	// Use `subscribers_by_user_type` endpoint in Calypso Stats.
	return {
		data: {
			total_email: results[ 3 ]?.data?.total,
			total_wpcom: results[ 2 ]?.data?.total,
			total: results[ 1 ]?.data?.total_subscribers,
			paid_subscribers: results[ 1 ]?.data?.paid_subscribers,
			free_subscribers:
				results[ 1 ]?.data?.total_subscribers !== undefined &&
				results[ 1 ]?.data?.paid_subscribers !== undefined
					? results[ 1 ].data.total_subscribers - results[ 1 ].data.paid_subscribers
					: null,
			social_followers: results[ 1 ]?.data?.social_followers,
			is_owner_subscribed: results[ 2 ]?.data?.is_owner_subscribed,
			// Merge email and wpcom subscribers and sort by date_subscribed, and only shows the most recent 10 subscribers.
			subscribers: [
				...( results[ 3 ]?.data?.subscribers ?? [] ),
				...( results[ 2 ]?.data?.subscribers ?? [] ),
			]
				.sort( sortByDateDesc )
				.slice( 0, MAX_SUBSCRIBERS_TO_RETURN ),
		},
		isLoading: results.some( ( result ) => result.isLoading ),
		isError: results.some( ( result ) => result.isError ),
	};
}

export default useSubscribersTotalsQueries;
