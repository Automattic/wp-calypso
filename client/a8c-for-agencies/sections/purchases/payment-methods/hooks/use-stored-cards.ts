import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import formatStoredCards from '../../lib/format-stored-cards';

export const getFetchStoredCardsKey = ( agencyId?: number ) => [ 'a4a-stored-cards', agencyId ];

export default function useStoredCards( staleTime: number = 0 ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getFetchStoredCardsKey( agencyId ),
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/stripe/payment-methods',
				},
				{
					...( agencyId && { agency_id: agencyId } ),
				}
			),
		enabled: !! agencyId,
		select: formatStoredCards,
		refetchOnWindowFocus: false,
		staleTime: staleTime,
		initialData: {
			items: [],
			per_page: 0,
			has_more: false,
		},
	} );
}
