import { normalizePurchase } from '../purchase';
import { wpcom } from '../wpcom-fetcher';
import type { Purchase } from '../purchase';

export async function setPurchaseAutoRenew(
	purchaseId: number,
	autoRenew: boolean
): Promise< { success: boolean; upgrade: Purchase } > {
	const action = autoRenew ? 'enable-auto-renew' : 'disable-auto-renew';
	const data = await wpcom.req.post( {
		path: `/upgrades/${ purchaseId }/${ action }`,
		apiVersion: '1.1',
	} );
	return {
		...data,
		upgrade: normalizePurchase( data.upgrade ),
	};
}
