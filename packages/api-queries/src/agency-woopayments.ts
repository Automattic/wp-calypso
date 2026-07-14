import { fetchAgencyWooPaymentsData } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const agencyWooPaymentsDataQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'woopayments', 'data' ],
		queryFn: () => fetchAgencyWooPaymentsData( agencyId ),
	} );
