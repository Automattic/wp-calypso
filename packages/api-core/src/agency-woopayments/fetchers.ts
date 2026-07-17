import { wpcom } from '../wpcom-fetcher';
import type { WooPaymentsData, WooPaymentsCommissionsReport } from './types';

export async function fetchAgencyWooPaymentsData( agencyId: number ): Promise< WooPaymentsData > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/woocommerce/woopayments`,
	} );
}

export async function fetchAgencyWooPaymentsCommissionsReport(
	agencyId: number,
	siteId: number
): Promise< WooPaymentsCommissionsReport > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/woocommerce/woopayments/${ siteId }`,
		},
		{ format: 'csv' }
	);
}
