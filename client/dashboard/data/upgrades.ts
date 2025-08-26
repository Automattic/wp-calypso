import wpcom from 'calypso/lib/wp';
import type { Purchase } from './purchase';

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
