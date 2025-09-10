import { normalizePurchase } from '../purchase';
import { wpcom } from '../wpcom-fetcher';
import type { Purchase } from '../purchase';

export async function fetchMonetizeSubscriptions(): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: '/me/purchases',
		apiVersion: '1.1',
	} );
	return data.map( normalizePurchase );
}
