import { useQuery, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import formatStoredCards from '../../lib/format-stored-cards';

interface Paging {
	startingAfter: string;
	endingBefore: string;
}

export const getFetchStoredCardsKey = ( agencyId?: number, paging?: Paging ) => [
	'a4a-stored-cards',
	paging,
	agencyId,
];

export default function useStoredCards( paging?: Paging, useStaleData = false ) {
	const agencyId = useSelector( getActiveAgencyId );

	const queryClient = useQueryClient();
	const data = queryClient.getQueryData( getFetchStoredCardsKey( agencyId, paging ) );

	let staleTime = 0;

	// If we have data and we want to use stale data, set the stale time to Infinity to prevent refetching.
	if ( useStaleData && data ) {
		staleTime = Infinity;
	}

	return useQuery( {
		staleTime,
		queryKey: getFetchStoredCardsKey( agencyId, paging ),
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/stripe/payment-methods',
				},
				{
					...( agencyId && { agency_id: agencyId } ),
					...( paging && {
						starting_after: paging.startingAfter,
						ending_before: paging.endingBefore,
					} ),
				}
			),
		enabled: !! agencyId,
		select: formatStoredCards,
		refetchOnWindowFocus: false,
		initialData: {
			items: [],
			per_page: 0,
			has_more: false,
		},
	} );
}
