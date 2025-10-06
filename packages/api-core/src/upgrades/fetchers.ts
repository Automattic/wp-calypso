import { normalizePurchase } from '../purchase';
import { wpcom } from '../wpcom-fetcher';
import type { Purchase } from '../purchase';

export async function fetchPurchase( purchaseId: number ): Promise< Purchase > {
	const data = await wpcom.req.get( {
		path: `/upgrades/${ purchaseId }`,
		apiVersion: '1.2',
	} );
	return normalizePurchase( data );
}
