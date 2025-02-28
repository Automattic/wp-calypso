import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function useFetchWooPaymentsData( {
	startDate,
	endDate,
	segment,
}: {
	/** Start date in YYYY-MM-DD format */
	startDate?: string;
	/** End date in YYYY-MM-DD format */
	endDate?: string;
	/** Time segment: 'day' | 'week' | 'month' | 'quarter' | 'year' */
	segment?: 'day' | 'week' | 'month' | 'quarter' | 'year';
} ) {
	const agencyId = useSelector( getActiveAgencyId );

	const isApiEnabled = false;

	return useQuery( {
		queryKey: [ 'a4a-site-woopayments-data', agencyId, startDate, endDate, segment, isApiEnabled ],
		queryFn: () =>
			isApiEnabled
				? wpcom.req.get(
						{
							apiNamespace: 'wpcom/v2',
							path: `/agency/${ agencyId }/woopayments`,
						},
						{
							...( startDate && { start_date: startDate } ),
							...( endDate && { end_date: endDate } ),
							...( segment && { segment } ),
						}
				  )
				: Promise.resolve( [] ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
