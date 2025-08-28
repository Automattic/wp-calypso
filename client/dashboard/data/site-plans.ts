import wpcom from 'calypso/lib/wp';

export interface Plan {
	id?: string | null;
	currency_code: string;
	current_plan?: boolean;
	expiry?: string;
	formatted_price: string;
	has_domain_credit?: boolean;
	product_name: string;
	product_slug: string;
	raw_price_integer: number;
	subscribed_date?: string;
	user_facing_expiry?: string;
}

export function fetchSitePlans( siteId: number ): Promise< Record< string, Plan > > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/plans`,
		apiVersion: '1.3',
	} );
}
