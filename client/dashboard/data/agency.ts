import wpcom from 'calypso/lib/wp';

export interface AgencyBlog {
	name: string;
	existing_wpcom_license_count: number;
	referral_status: 'active' | 'pending' | 'canceled' | 'archived';
	prices: {
		actual_price: number;
		currency: string;
	};
}

export async function fetchAgencyBlog( siteId: string ): Promise< AgencyBlog > {
	return wpcom.req.get( {
		path: `/agency/blog/${ siteId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
