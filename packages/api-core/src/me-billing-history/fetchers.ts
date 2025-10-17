import { wpcom } from '../wpcom-fetcher';
import type { Receipt } from './types';

export async function fetchReceipt( receiptId: number ): Promise< Receipt > {
	return wpcom.req.get( {
		path: `/me/billing-history/receipt/${ receiptId }`,
		apiVersion: '1.2',
	} );
}

export async function sendBillingReceiptEmail( receiptId: string ): Promise< unknown > {
	return wpcom.req.get( `/me/billing-history/receipt/${ receiptId }/email` );
}
