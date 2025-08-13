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

export async function setPurchaseAutoRenew(
	purchaseId: number,
	autoRenew: boolean
): Promise< { success: boolean; upgrade: Purchase } > {
	const action = autoRenew ? 'enable-auto-renew' : 'disable-auto-renew';
	return wpcom.req.post( {
		path: `/upgrades/${ purchaseId }/${ action }`,
		apiVersion: '1.1',
	} );
}
