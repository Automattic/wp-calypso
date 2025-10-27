import { wpcom } from '../wpcom-fetcher';
import type { Receipt } from './types';

export async function fetchUserReceipts(): Promise< Receipt[] > {
	const limit = 600;
	const url = '/me/billing-history/past?limit=' + limit;

	const { billing_history, billing_history_total } = await wpcom.req.get( {
		path: url,
		apiVersion: '1.3',
	} );

	let billingHistoryTotal = billing_history_total ?? 0;
	const fullBillingHistory = billing_history ?? [];
	if ( fullBillingHistory.length === limit && billingHistoryTotal !== limit ) {
		// If we have exactly the requested number of transactions (and this is
		// not the full total), it means there are more transactions to fetch.
		while ( fullBillingHistory.length < billingHistoryTotal ) {
			// Fetch the next page of transactions.
			const offset_url = url + '&offset=' + fullBillingHistory.length;

			const res = await wpcom.req.get( {
				path: offset_url,
				apiVersion: '1.3',
			} );

			const newBillingHistoryChunk = res.billing_history ?? [];
			if ( newBillingHistoryChunk.length === 0 ) {
				// Prevent potential infinite loop if no more transactions are returned.
				break;
			}
			fullBillingHistory.push( ...newBillingHistoryChunk );

			// Value is updated in case the value changes in the back-end
			billingHistoryTotal = res.billing_history_total ?? 0;
		}
	}

	return fullBillingHistory;
}

export async function fetchReceipt( receiptId: number ): Promise< Receipt > {
	return wpcom.req.get( {
		path: `/me/billing-history/receipt/${ receiptId }`,
		apiVersion: '1.2',
	} );
}

export async function sendBillingReceiptEmail( receiptId: string ): Promise< unknown > {
	return wpcom.req.get( `/me/billing-history/receipt/${ receiptId }/email` );
}
