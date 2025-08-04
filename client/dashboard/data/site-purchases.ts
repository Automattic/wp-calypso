import wpcom from 'calypso/lib/wp';

export interface Purchase {
	ID: string;
	active: boolean;
	expiry_message: string;
	is_cancelable: boolean;
	partner_name: string;
	product_slug: string;
	user_id: string;
}

export async function fetchSitePurchases( siteId: number ): Promise< Purchase[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/purchases`,
	} );
}
