import { STATIC_SITE_IMPORT_FLOW } from '@automattic/onboarding';
import debugFactory from 'debug';
import { recordPurchase } from 'calypso/lib/analytics/record-purchase';
import { recordSignupComplete, SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	mergeDomainMappingsIntoDomains,
	removeFailedPurchases,
} from 'calypso/lib/analytics/utils/receipt-item-details';
import { getSignupIsNewUserAndClear } from 'calypso/signup/storageUtils';
import { recordCompositeCheckoutErrorDuringAnalytics } from './analytics';
import type { Receipt } from '@automattic/api-core';

const debug = debugFactory( 'calypso:composite-checkout:record-completed-purchase-analytics' );

const RECORDED_RECEIPTS_STORAGE_KEY = 'checkout-recorded-purchase-receipt-ids';
const MAX_RECORDED_RECEIPTS = 20;

/**
 * The longest we will wait for third-party tracking scripts before letting
 * the caller continue (eg: by redirecting away from the page).
 */
const ANALYTICS_TIMEOUT_MS = 3000;

interface SignupContext {
	flow?: string;
	userId?: number | null;
}

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
	signupContext: SignupContext = {}
): Promise< void > {
	const receipt = removeFailedPurchases( mergeDomainMappingsIntoDomains( fullReceipt ) );
	if ( getRecordedReceiptIds().includes( receipt.id ) ) {
		debug( 'receipt already recorded', receipt.id );
		return;
	}
	markReceiptRecorded( receipt.id );
	debug( 'recording purchase for receipt', receipt.id );

	recordDomainBundlePurchasedEvents( receipt );
	recordStaticSiteImportSignup( receipt, signupContext );

	const purchaseRecorded = recordPurchase( receipt ).catch( ( error ) => {
		// eslint-disable-next-line no-console
		console.error( error );
		recordCompositeCheckoutErrorDuringAnalytics( {
			errorObject: error as Error,
			failureDescription: 'recordCompletedPurchaseAnalytics',
		} );
	} );
	const timeout = new Promise< void >( ( resolve ) => setTimeout( resolve, ANALYTICS_TIMEOUT_MS ) );
	await Promise.race( [ purchaseRecorded, timeout ] );
}

function recordStaticSiteImportSignup( receipt: Receipt, { flow, userId }: SignupContext ) {
	if ( flow !== STATIC_SITE_IMPORT_FLOW || receipt.checkout_type !== 'unified' ) {
		return;
	}
	const plan = receipt.items.find( ( item ) => item.is_plan && item.type === 'new purchase' );
	if ( ! plan?.site_id ) {
		return;
	}

	recordSignupComplete(
		{
			flow,
			siteId: plan.site_id,
			isNewUser: Boolean( getSignupIsNewUserAndClear( userId ) ),
			isBlankCanvas: undefined,
			hasCartItems: true,
			planProductSlug: plan.wpcom_product_slug,
			domainProductSlug: undefined,
			theme: undefined,
			intent: flow,
			startingPoint: flow,
			isTransfer: undefined,
			isMapping: undefined,
			signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.NOT_SET,
			framework: 'stepper',
			goals: undefined,
		},
		true
	);
}

/**
 * Completes the domain bundle funnel (shown -> accepted -> purchased) by firing one
 * `calypso_domain_bundle_purchased` Tracks event per distinct bundle in the receipt.
 * Matches the shape of the `shown`/`accepted` events emitted during domain search.
 */
function recordDomainBundlePurchasedEvents( receipt: Receipt ) {
	const domainCountByBundle = new Map< string, number >();
	for ( const item of receipt.items ) {
		const groupId = item.domain_bundle_group_id;
		if ( ! groupId ) {
			continue;
		}
		domainCountByBundle.set( groupId, ( domainCountByBundle.get( groupId ) ?? 0 ) + 1 );
	}

	for ( const [ groupId, domainCount ] of domainCountByBundle ) {
		recordTracksEvent( 'calypso_domain_bundle_purchased', {
			domain_bundle_group_id: groupId,
			domain_count: domainCount,
		} );
	}
}
