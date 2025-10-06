import { normalizePurchase } from '../purchase';
import { wpcom } from '../wpcom-fetcher';
import type { Purchase } from '../purchase';

export async function fetchSitePurchases( siteId: number | string ): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: `/sites/${ siteId }/purchases`,
		apiVersion: '1.2',
	} );
	return data.map( normalizePurchase );
}
