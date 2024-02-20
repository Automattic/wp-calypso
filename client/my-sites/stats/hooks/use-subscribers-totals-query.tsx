import { useQueries } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

const querySubscribersTotals = ( siteId: number | null, filterAdmin?: boolean ): Promise< any > => {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/stats/followers`,
		},
		{
			type: 'all',
			filter_admin: filterAdmin ? true : false,
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
	is_owner_subscribing: boolean;
} ) => {
	return {
		total: payload.total,
		total_email: payload.total_email,
		total_wpcom: payload.total_wpcom,
		is_owner_subscribing: payload.is_owner_subscribing,
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
				queryKey: [ 'stats', 'totals', 'subscribers', siteId, filterAdmin ],
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
		],
	} );

	return {
		data: {
			total_email: queries[ 0 ]?.data?.total_email,
			total_wpcom: queries[ 0 ]?.data?.total_wpcom,
			total: queries[ 0 ]?.data?.total,
			paid_subscribers: queries[ 1 ]?.data?.paid_subscribers,
			free_subscribers:
				queries[ 1 ]?.data?.email_subscribers !== undefined &&
				queries[ 1 ]?.data?.paid_subscribers !== undefined
					? queries[ 1 ].data.email_subscribers - queries[ 1 ].data.paid_subscribers
					: null,
			social_followers: queries[ 1 ]?.data?.social_followers,
			is_owner_subscribing: queries[ 0 ]?.data?.is_owner_subscribing,
		},
		isLoading: queries.some( ( result ) => result.isLoading ),
		isError: queries.some( ( result ) => result.isError ),
	};
}

export default useSubscribersTotalsQueries;
