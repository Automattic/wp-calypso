import { normalizePurchase } from '../upgrades';
import { wpcom } from '../wpcom-fetcher';
import type { Purchase } from '../upgrades';

export async function fetchUserTransferredPurchases(): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: '/me/purchases/transferred',
		apiVersion: '1.2',
	} );
	return data.map( normalizePurchase );
}
