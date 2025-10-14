import { normalizePurchase } from '../purchase';
import { wpcom } from '../wpcom-fetcher';
import type { Purchase } from '../purchase';

export async function fetchUserTransferredPurchases(): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: '/me/purchases/transferred',
		apiVersion: '1.2',
	} );
	return data.map( normalizePurchase );
}
