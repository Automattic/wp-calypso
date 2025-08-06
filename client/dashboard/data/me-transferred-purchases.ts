import wpcom from 'calypso/lib/wp';
import type { Purchase } from './purchase';

export async function fetchTransferredPurchases(): Promise< Purchase[] > {
	return wpcom.req.get( {
		path: '/me/purchases/transferred',
		apiVersion: '1.1',
	} );
}
