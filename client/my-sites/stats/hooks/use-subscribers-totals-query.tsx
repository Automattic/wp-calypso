import { useQueries } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const querySubscribersTotals = ( siteId: number | null ): Promise< any > => {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/stats/followers`,
	} );
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
} ) => {
	return {
		total_email: payload.total_email,
		total_wpcom: payload.total_wpcom,
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
		email_subscribers: payload?.counts?.email_subscribers || 0,
		paid_subscribers: payload?.counts?.paid_subscribers || 0,
		social_followers: payload?.counts?.social_followers || 0,
	};
};

export default function useSubscribersTotalsQueries( siteId: number | null ) {
	const queries = useQueries( {
		queries: [
			{
				queryKey: [ 'stats', 'totals', 'subscribers', siteId ],
				queryFn: () => querySubscribersTotals( siteId ),
				select: selectSubscribers,
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
			{
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
			total: queries[ 1 ]?.data?.email_subscribers,
			paid_subscribers: queries[ 1 ]?.data?.paid_subscribers,
			free_subscribers:
				queries[ 1 ]?.data?.email_subscribers !== undefined &&
				queries[ 1 ]?.data?.paid_subscribers !== undefined
					? queries[ 1 ].data.email_subscribers - queries[ 1 ].data.paid_subscribers
					: 0,
			social_followers: queries[ 1 ]?.data?.social_followers,
		},
		isLoading: queries.some( ( result ) => result.isLoading ),
		isError: queries.some( ( result ) => result.isError ),
	};
}
