import { wpcom } from '../wpcom-fetcher';
import type {
	AgencyWooPaymentsData,
	AgencyWooPaymentsReport,
	AgencyWooPaymentsSiteState,
} from './types';

const LICENSES_PAGE_SIZE = 100;
const WOOPAYMENTS_PLUGIN = 'woocommerce-payments/woocommerce-payments';

export function fetchAgencyWooPaymentsCommissions(
	agencyId: number
): Promise< AgencyWooPaymentsData > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/woocommerce/woopayments`,
	} );
}

export async function fetchAgencyWooPaymentsCommissionsReport(
	agencyId: number,
	siteId: number
): Promise< AgencyWooPaymentsReport > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/woocommerce/woopayments/${ siteId }?format=csv`,
	} );
}

export async function fetchAgencyWooPaymentsLicensedSites(
	agencyId: number
): Promise< AgencyWooPaymentsSiteState[] > {
	const sites: AgencyWooPaymentsSiteState[] = [];
	let page = 1;
	let hasMore = true;

	while ( hasMore ) {
		const response = await wpcom.req.get(
			{ apiNamespace: 'wpcom/v2', path: '/jetpack-licensing/licenses' },
			{
				agency_id: agencyId,
				search: 'woopayments',
				filter: 'attached',
				sort_field: 'issued_at',
				sort_direction: 'desc',
				page,
				per_page: LICENSES_PAGE_SIZE,
			}
		);
		for ( const item of response.items ?? [] ) {
			if ( item.blog_id ) {
				sites.push( { blogId: item.blog_id, siteUrl: item.siteurl ?? '', state: '' } );
			}
		}
		hasMore = page < ( response.total_pages ?? 1 );
		page++;
	}

	return sites;
}

export async function fetchAgencyWooPaymentsPluginSites(
	agencyId: number
): Promise< AgencyWooPaymentsSiteState[] > {
	const response = await wpcom.req.get(
		{ apiNamespace: 'wpcom/v2', path: `/agency/${ agencyId }/sites` },
		{ filters: { plugins: [ WOOPAYMENTS_PLUGIN ] } }
	);
	const items = Array.isArray( response ) ? response : response?.sites ?? [];
	return items.map( ( site: { blog_id: number; url: string; state: string } ) => ( {
		blogId: site.blog_id,
		siteUrl: site.url,
		state: site.state,
	} ) );
}
