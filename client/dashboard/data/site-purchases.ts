import wpcom from 'calypso/lib/wp';
import { normalizePurchase } from './purchase';
import type { Purchase } from './purchase';

export async function fetchSitePurchases( siteId: number | string ): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: `/sites/${ siteId }/purchases`,
		apiVersion: '1.1',
	} );
	return data.map( normalizePurchase );
}
