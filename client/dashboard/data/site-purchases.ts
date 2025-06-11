import wpcom from 'calypso/lib/wp';

export interface Purchase {
	ID: number | string;
	active: boolean;
	is_cancelable: boolean;
	product_slug: string;
	user_id: number | string;
}

export async function fetchSitePurchases( siteId: string ): Promise< Purchase[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/purchases`,
	} );
}
