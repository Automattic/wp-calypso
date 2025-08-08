import wpcom from 'calypso/lib/wp';
import type { Purchase } from './purchase';

export async function fetchUserPurchases(): Promise< Purchase[] > {
	return await wpcom.req.get( {
		path: '/me/purchases',
		apiVersion: '1.1',
	} );
}

export async function fetchUserTransferredPurchases(): Promise< Purchase[] > {
	return await wpcom.req.get( {
		path: '/me/purchases/transferred',
		apiVersion: '1.1',
	} );
}
