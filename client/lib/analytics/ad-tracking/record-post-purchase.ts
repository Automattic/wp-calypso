import { getCurrentUser } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { mayWeTrackByTracker } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';
import { loadTrackingScripts } from './load-tracking-scripts';
import type { Receipt } from '@automattic/api-core';
import type { ResponseCart } from '@automattic/shopping-cart';

// Ensure setup has run.
import './setup';

export const POST_PURCHASE_WPCOM_GOOGLE_ADS_FEATURE = 'ad-tracking/post-purchase-wpcom-google-ads';

type PostPurchaseTrackingSource = 'checkout-pending' | 'one-click-modal';

type RecordPostPurchaseTrackingArgs = {
	receiptId: number;
	cart?: ResponseCart;
	receipt?: Receipt;
	source: PostPurchaseTrackingSource;
};

type WpcomGoogleAdsPurchaseConversionArgs = {
	value: number;
	currency: string;
	transactionId: number | null | undefined;
};

type ConversionValue = {
	value: number;
	currency: string;
};

const trackedPurchases = new Set< string >();

export function isPostPurchaseWpcomGoogleAdsEnabled(): boolean {
	return config.isEnabled( POST_PURCHASE_WPCOM_GOOGLE_ADS_FEATURE );
}

export function recordPostPurchaseTracking( args: RecordPostPurchaseTrackingArgs ): void {
	try {
		recordPostPurchaseWpcomGoogleAdsPurchase( args );
	} catch ( error ) {
		debug( 'recordPostPurchaseTracking: error recording post-purchase tracking', error );
	}
}

export function recordWpcomGoogleAdsPurchaseConversion( {
	value,
	currency,
	transactionId,
}: WpcomGoogleAdsPurchaseConversionArgs ): void {
	if ( typeof window === 'undefined' || ! mayWeTrackByTracker( 'googleAds' ) ) {
		debug(
			'recordWpcomGoogleAdsPurchaseConversion: skipping as Google Ads tracking is disallowed'
		);
		return;
	}

	setWpcomGoogleAdsEnhancedConversionUserData();

	const params = [
		'event',
		'conversion',
		{
			send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
			value,
			currency,
			transaction_id: transactionId,
		},
	] as const;
	debug( 'recordWpcomGoogleAdsPurchaseConversion: Record WPCom Purchase', params );
	window.gtag( ...params );
}

export function setWpcomGoogleAdsEnhancedConversionUserData(): void {
	if ( typeof window === 'undefined' || ! mayWeTrackByTracker( 'googleAds' ) ) {
		debug(
			'setWpcomGoogleAdsEnhancedConversionUserData: skipping as Google Ads tracking is disallowed'
		);
		return;
	}

	const currentUser = getCurrentUser();

	// SHA256 hash of current user's email address for enhanced conversion matching.
	const currentUserHashedEmail = currentUser?.hashedPii?.email ?? '';

	window.gtag( 'set', 'user_data', {
		sha256_email_address: currentUserHashedEmail,
	} );
}

function recordPostPurchaseWpcomGoogleAdsPurchase( {
	receiptId,
	cart,
	receipt,
	source,
}: RecordPostPurchaseTrackingArgs ): void {
	if ( ! isPostPurchaseWpcomGoogleAdsEnabled() ) {
		return;
	}

	if ( typeof window === 'undefined' ) {
		return;
	}

	if ( ! receiptId ) {
		debug( 'recordPostPurchaseTracking: skipping WPCom Google Ads purchase without receipt id' );
		return;
	}

	if ( ! mayWeTrackByTracker( 'googleAds' ) ) {
		debug( 'recordPostPurchaseTracking: skipping as Google Ads tracking is disallowed' );
		return;
	}

	if ( cart?.is_signup ) {
		debug( 'recordPostPurchaseTracking: skipping signup cart', { receiptId, source } );
		return;
	}

	const conversionValue = getConversionValue( receipt, cart );
	if ( ! conversionValue ) {
		debug( 'recordPostPurchaseTracking: skipping non-positive purchase value', {
			receiptId,
			source,
		} );
		return;
	}

	const dedupeKey = `wpcom_google_ads_purchase:${ receiptId }`;
	if ( hasTrackedPurchase( dedupeKey ) ) {
		debug( 'recordPostPurchaseTracking: skipping duplicate WPCom Google Ads purchase', {
			receiptId,
			source,
		} );
		return;
	}

	rememberTrackedPurchase( dedupeKey );
	loadTrackingScriptsWithoutWaiting();

	recordWpcomGoogleAdsPurchaseConversion( {
		value: conversionValue.value,
		currency: conversionValue.currency,
		transactionId: receiptId,
	} );
}

function getConversionValue( receipt?: Receipt, cart?: ResponseCart ): ConversionValue | null {
	if ( receipt ) {
		const value = receipt.amount_integer / 100;
		if ( ! Number.isFinite( value ) || receipt.amount_integer <= 0 ) {
			return null;
		}

		return {
			value,
			currency: receipt.currency,
		};
	}

	if ( cart ) {
		if ( ! Number.isFinite( cart.total_cost ) || cart.total_cost < 0.01 ) {
			return null;
		}

		return {
			value: cart.total_cost,
			currency: cart.currency,
		};
	}

	return null;
}

function hasTrackedPurchase( key: string ): boolean {
	if ( trackedPurchases.has( key ) ) {
		return true;
	}

	if ( hasTrackedPurchaseInSession( key ) ) {
		trackedPurchases.add( key );
		return true;
	}

	return false;
}

function rememberTrackedPurchase( key: string ): void {
	trackedPurchases.add( key );

	try {
		window.sessionStorage.setItem( `calypso:post_purchase_tracking:${ key }`, '1' );
	} catch {
		// Best-effort same-tab dedupe only.
	}
}

function hasTrackedPurchaseInSession( key: string ): boolean {
	try {
		return window.sessionStorage.getItem( `calypso:post_purchase_tracking:${ key }` ) === '1';
	} catch {
		return false;
	}
}

function loadTrackingScriptsWithoutWaiting(): void {
	try {
		Promise.resolve( loadTrackingScripts() ).catch( ( error ) => {
			debug( 'recordPostPurchaseTracking: error loading tracking scripts', error );
		} );
	} catch ( error ) {
		debug( 'recordPostPurchaseTracking: error loading tracking scripts', error );
	}
}
