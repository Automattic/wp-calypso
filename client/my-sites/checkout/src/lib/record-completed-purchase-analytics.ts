import debugFactory from 'debug';
import { recordPurchase } from 'calypso/lib/analytics/record-purchase';
import { mergeDomainMappingsIntoDomains } from 'calypso/lib/analytics/utils/receipt-item-details';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordCompositeCheckoutErrorDuringAnalytics } from './analytics';
import type { Receipt } from '@automattic/api-core';
import type { CalypsoDispatch } from 'calypso/state/types';

const debug = debugFactory( 'calypso:composite-checkout:record-completed-purchase-analytics' );

const RECORDED_RECEIPTS_STORAGE_KEY = 'checkout-recorded-purchase-receipt-ids';
const MAX_RECORDED_RECEIPTS = 20;

/**
 * The longest we will wait for third-party tracking scripts before letting
 * the caller continue (eg: by redirecting away from the page).
 */
const ANALYTICS_TIMEOUT_MS = 3000;

function getRecordedReceiptIds(): number[] {
	try {
		const stored = JSON.parse(
			window.localStorage.getItem( RECORDED_RECEIPTS_STORAGE_KEY ) ?? '[]'
		);
		return Array.isArray( stored ) ? stored : [];
	} catch {
		return [];
	}
}

function markReceiptRecorded( receiptId: number ): void {
	try {
		const recordedIds = [ ...getRecordedReceiptIds(), receiptId ].slice( -MAX_RECORDED_RECEIPTS );
		window.localStorage.setItem( RECORDED_RECEIPTS_STORAGE_KEY, JSON.stringify( recordedIds ) );
	} catch {
		// If storage is unavailable, a reload of the page may record the purchase again.
	}
}

/**
 * Records analytics for a purchase that has finished processing.
 *
 * Call this only once the order is known to be complete (eg: on the pending
 * page after polling the order), not when the checkout form is submitted.
 * Each receipt is only recorded once per browser, so it is safe to call again
 * if the page reloads.
 *
 * Resolves when the analytics have been sent or after a timeout, whichever
 * comes first. It never rejects.
 */
export async function recordCompletedPurchaseAnalytics(
	fullReceipt: Receipt,
	reduxDispatch: CalypsoDispatch
): Promise< void > {
	const receipt = mergeDomainMappingsIntoDomains( fullReceipt );
	if ( getRecordedReceiptIds().includes( receipt.id ) ) {
		debug( 'receipt already recorded', receipt.id );
		return;
	}
	markReceiptRecorded( receipt.id );
	debug( 'recording purchase for receipt', receipt.id );

	recordDomainBundlePurchasedEvents( receipt, reduxDispatch );

	const purchaseRecorded = recordPurchase( receipt ).catch( ( error ) => {
		// eslint-disable-next-line no-console
		console.error( error );
		reduxDispatch(
			recordCompositeCheckoutErrorDuringAnalytics( {
				errorObject: error as Error,
				failureDescription: 'recordCompletedPurchaseAnalytics',
			} )
		);
	} );
	const timeout = new Promise< void >( ( resolve ) => setTimeout( resolve, ANALYTICS_TIMEOUT_MS ) );
	await Promise.race( [ purchaseRecorded, timeout ] );
}

/**
 * Completes the domain bundle funnel (shown -> accepted -> purchased) by firing one
 * `calypso_domain_bundle_purchased` Tracks event per distinct bundle in the receipt.
 * Matches the shape of the `shown`/`accepted` events emitted during domain search.
 */
function recordDomainBundlePurchasedEvents( receipt: Receipt, reduxDispatch: CalypsoDispatch ) {
	const domainCountByBundle = new Map< string, number >();
	for ( const item of receipt.items ) {
		const groupId = item.domain_bundle_group_id;
		if ( ! groupId ) {
			continue;
		}
		domainCountByBundle.set( groupId, ( domainCountByBundle.get( groupId ) ?? 0 ) + 1 );
	}

	for ( const [ groupId, domainCount ] of domainCountByBundle ) {
		reduxDispatch(
			recordTracksEvent( 'calypso_domain_bundle_purchased', {
				domain_bundle_group_id: groupId,
				domain_count: domainCount,
			} )
		);
	}
}
