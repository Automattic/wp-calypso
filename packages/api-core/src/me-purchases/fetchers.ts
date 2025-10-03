import { normalizePurchase } from '../purchase';
import { wpcom } from '../wpcom-fetcher';
import type { Purchase } from '../purchase';

export async function fetchUserPurchases(): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: '/me/purchases',
		apiVersion: '1.1',
	} );
	return data.map( normalizePurchase );
}

export async function fetchUserTransferredPurchases(): Promise< Purchase[] > {
	const data = await wpcom.req.get( {
		path: '/me/purchases/transferred',
		apiVersion: '1.1',
	} );
	return data.map( normalizePurchase );
}
