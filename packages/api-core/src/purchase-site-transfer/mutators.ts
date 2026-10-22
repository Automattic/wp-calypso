import { wpcom } from '../wpcom-fetcher';
import type { SiteTransferRequest, SiteTransferResult } from './types';

export async function transferPurchaseToSite(
	purchaseId: number,
	request: SiteTransferRequest
): Promise< SiteTransferResult > {
	return wpcom.req.post( {
		path: `/upgrades/${ purchaseId }/site-transfer`,
		apiNamespace: 'wpcom/v2',
		body: request,
	} );
}
