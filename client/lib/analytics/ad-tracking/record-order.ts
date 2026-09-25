import { getCurrentUser } from '@automattic/calypso-analytics';
import { costToUSD, refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker } from '../tracker-buckets';
import {
	getReceiptCouponCode,
	getReceiptItemBillPeriod,
	getReceiptItemCost,
	getReceiptItemName,
	getReceiptTotal,
	isSaleCouponAppliedToReceiptItem,
} from '../utils/receipt-item-details';
import { receiptToGaPurchase } from '../utils/receipt-to-ga-purchase';
import { splitReceiptItems } from '../utils/split-receipt-items';
import {
	debug,
	TRACKING_IDS,
	EXPERIAN_CONVERSION_PIXEL_URL,
	YAHOO_GEMINI_CONVERSION_PIXEL_URL,
	PANDORA_CONVERSION_PIXEL_URL,
	ICON_MEDIA_ORDER_PIXEL_URL,
} from './constants';
import { receiptToCriteoItems, recordInCriteo } from './criteo';
import { circularReferenceSafeJSONStringify } from './debug';
import { recordParamsInFloodlightGtag } from './floodlight';
import {
	fireEcommercePurchase as fireEcommercePurchaseGA4,
	Ga4PropertyGtag,
} from './google-analytics-4';
import { initGTMContainer, loadGTMContainer } from './gtm-container';
import { loadTrackingScripts } from './load-tracking-scripts';
import { loadParselyTracker } from './parsely';
import { isWooExpressUpgrade } from './woo';
import type { Receipt, ReceiptItem } from '@automattic/api-core';
import type { WpcomJetpackReceiptInfo } from 'calypso/lib/analytics/utils/split-receipt-items';

// Ensure setup has run.
import './setup';

declare global {
	interface Window {
		qp: ( ...args: any[] ) => void;
		twq: ( ...args: any[] ) => void;
		fbq: ( ...args: any[] ) => void;
		gtag: ( ...args: any[] ) => void;
		pintrk: ( ...args: any[] ) => void;
		adRoll: { trackPurchase: () => void };
		lintrk: ( key: string, val: Record< string, any > ) => void;
		_qevents: any[];
		uetq: any[];
		rdt: any[] & { ( ...args: any[] ): void };
		ttq: any;
		oaiq: any;
	}
}

/**
 * Tracks a purchase conversion
 */
export async function recordOrder( receipt: Receipt ): Promise< void > {
	await refreshCountryCodeCookieGdpr();

	await loadTrackingScripts();

	const usdTotalCost = costToUSD( getReceiptTotal( receipt ), receipt.currency );

	// Purchase tracking happens in one of three ways:

	// Fire one tracking event that includes details about the entire order

	const receiptInfo = splitReceiptItems( receipt );
	debug( 'recordOrder: receiptInfo:', receiptInfo );

	recordOrderInGoogleAds( receipt, receiptInfo );
	recordOrderInFacebook( receipt, receiptInfo );
	recordOrderInFloodlight( receipt, receiptInfo );
	recordOrderInBing( receipt, receiptInfo );
	recordOrderInQuantcast( receipt, receiptInfo );
	recordOrderInCriteo( receipt );
	recordOrderInJetpackGA( receipt, receiptInfo );
	recordOrderInWPcomGA4( receipt, receiptInfo );
	recordOrderInParsely( receiptInfo );
	recordOrderInAkismetGA( receipt, receiptInfo );
	recordOrderInWooGTM( receipt );
	recordOrderInAkismetGTM( receipt, receiptInfo );
	recordOrderInJetpackGTM( receipt, receiptInfo );
	recordOrderInReddit( receipt, receiptInfo );
	recordOrderInTikTok( receipt, receiptInfo );
	recordOrderInOpenAI( receipt, receiptInfo );

	// Fire a single tracking event without any details about what was purchased

	// Experian / One 2 One Media
	if ( mayWeTrackByTracker( 'experian' ) ) {
		debug( 'recordOrder: [Experian]', EXPERIAN_CONVERSION_PIXEL_URL );
		new window.Image().src = EXPERIAN_CONVERSION_PIXEL_URL;
	}

	// Yahoo Gemini
	if ( mayWeTrackByTracker( 'gemini' ) ) {
		const params =
			YAHOO_GEMINI_CONVERSION_PIXEL_URL + ( usdTotalCost !== null ? '&gv=' + usdTotalCost : '' );
		debug( 'recordOrder: [Yahoo Gemini]', params );
		new window.Image().src = params;
	}

	if ( mayWeTrackByTracker( 'pandora' ) ) {
		debug( 'recordOrder: [Pandora]', PANDORA_CONVERSION_PIXEL_URL );
		new window.Image().src = PANDORA_CONVERSION_PIXEL_URL;
	}

	if ( mayWeTrackByTracker( 'quora' ) ) {
		const params = [ 'track', 'Purchase' ];
		debug( 'recordOrder: [Quora]', params );
		window.qp( 'track', 'Purchase', { value: usdTotalCost } );
	}

	if ( mayWeTrackByTracker( 'iconMedia' ) ) {
		const skus = receipt.items.map( ( item ) => item.wpcom_product_slug ).join( ',' );
		const params =
			ICON_MEDIA_ORDER_PIXEL_URL + `&tx=${ receipt.id }&sku=${ skus }&price=${ usdTotalCost }`;
		debug( 'recordOrder: [Icon Media]', params );
		new window.Image().src = params;
	}

	// Twitter
	if ( mayWeTrackByTracker( 'twitter' ) ) {
		const params = [ 'event', 'tw-nvzbs-ode0u', { value: usdTotalCost } ];
		debug( 'recordOrder: [Twitter]', params );
		window.twq( ...params );
	}

	// Pinterest
	if ( mayWeTrackByTracker( 'pinterest' ) ) {
		const params = [
			'track',
			'checkout',
			{
				value: getReceiptTotal( receipt ),
				currency: receipt.currency,
				line_items: receipt.items.map( ( item ) => ( {
					product_name: getReceiptItemName( item ),
					product_id: item.wpcom_product_slug,
				} ) ),
				order_id: receipt.id,
			},
		];
		debug( 'recordOrder: [Pinterest]', params );
		window.pintrk( ...params );
	}

	// AdRoll
	if ( mayWeTrackByTracker( 'adroll' ) ) {
		debug( 'recordOrder: [AdRoll]' );
		window.adRoll.trackPurchase();
	}

	if ( mayWeTrackByTracker( 'linkedin' ) && receiptInfo.containsJetpackItems ) {
		const params = { conversion_id: 10947410 };

		debug( 'recordOrder: [LinkedIn]', params );
		window.lintrk( 'track', params );
	}

	if ( mayWeTrackByTracker( 'linkedin' ) && receiptInfo.containsWpcomItems ) {
		const params = {
			conversion_id: 19839620,
			conversion_value: usdTotalCost,
			conversion_currency: 'USD',
		};

		debug( 'recordOrder: [LinkedIn]', params );
		window.lintrk( 'track', params );
	}

	if ( mayWeTrackByTracker( 'twitter' ) && receiptInfo.containsJetpackItems ) {
		const params = [ 'event', 'tw-odlje-oekzo', { value: receiptInfo.jetpackCostUSD } ];
		debug( 'recordOrder: [Twitter]', params );
		window.twq( ...params );
	}

	// Uses JSON.stringify() to print the expanded object because during localhost or .live testing after firing this
	// event we redirect the user to wordpress.com which causes a domain change preventing the expanding and inspection
	// of any object in the JS console since they are no longer available.
	debug( 'recordOrder: dataLayer:', circularReferenceSafeJSONStringify( window.dataLayer, 2 ) );
}

/**
 * Records an order in Quantcast
 */
function recordOrderInQuantcast( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'quantcast' ) ) {
		return;
	}

	if ( receiptInfo.containsWpcomItems ) {
		if ( null !== receiptInfo.wpcomCostUSD ) {
			// Note that all properties have to be strings or they won't get tracked
			const params = {
				qacct: TRACKING_IDS.quantcast,
				labels:
					'_fp.event.Purchase Confirmation,_fp.pcat.' +
					receiptInfo.wpcomItems.map( ( item ) => item.wpcom_product_slug ).join( ' ' ),
				orderid: String( receipt.id ),
				revenue: receiptInfo.wpcomCostUSD.toString(),
				event: 'refresh',
			};
			debug( 'recordOrderInQuantcast: record WPCom purchase', params );
			window._qevents.push( params );
		} else {
			debug(
				`recordOrderInQuantcast: currency ${ receipt.currency } not supported, dropping WPCom pixel`
			);
		}
	}

	if ( receiptInfo.containsJetpackItems ) {
		if ( null !== receiptInfo.jetpackCostUSD ) {
			// Note that all properties have to be strings or they won't get tracked
			const params = {
				qacct: TRACKING_IDS.quantcast,
				labels:
					'_fp.event.Purchase Confirmation,_fp.pcat.' +
					receiptInfo.jetpackItems.map( ( item ) => item.wpcom_product_slug ).join( ' ' ),
				orderid: String( receipt.id ),
				revenue: receiptInfo.jetpackCostUSD.toString(),
				event: 'refresh',
			};
			debug( 'recordOrderInQuantcast: record Jetpack purchase', params );
			window._qevents.push( params );
		} else {
			debug(
				`recordOrderInQuantcast: currency ${ receipt.currency } not supported, dropping Jetpack pixel`
			);
		}
	}
}

/**
 * Records an order in DCM Floodlight
 */
function recordOrderInFloodlight( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'floodlight' ) ) {
		return;
	}

	debug( 'recordOrderInFloodlight: record purchase' );

	debug( 'recordOrderInFloodlight:' );
	recordParamsInFloodlightGtag( {
		value: receiptInfo.totalCostUSD,
		transaction_id: receipt.id,
		u1: receiptInfo.totalCostUSD,
		u2: receipt.items.map( ( item ) => getReceiptItemName( item ) ).join( ', ' ),
		u3: 'USD',
		u8: receipt.id,
		send_to: 'DC-6355556/wpsal0/wpsale+transactions',
	} );

	// WPCom
	if ( receiptInfo.containsWpcomItems ) {
		debug( 'recordOrderInFloodlight: WPCom' );
		recordParamsInFloodlightGtag( {
			value: receiptInfo.wpcomCostUSD,
			transaction_id: receipt.id,
			u1: receiptInfo.wpcomCostUSD,
			u2: receiptInfo.wpcomItems.map( ( item ) => getReceiptItemName( item ) ).join( ', ' ),
			u3: 'USD',
			u8: receipt.id,
			send_to: 'DC-6355556/wpsal0/purch0+transactions',
		} );
	}

	// Jetpack
	if ( receiptInfo.containsJetpackItems ) {
		debug( 'recordOrderInFloodlight: Jetpack' );
		recordParamsInFloodlightGtag( {
			value: receiptInfo.jetpackCostUSD,
			transaction_id: receipt.id,
			u1: receiptInfo.jetpackCostUSD,
			u2: receiptInfo.jetpackItems.map( ( item ) => getReceiptItemName( item ) ).join( ', ' ),
			u3: 'USD',
			u8: receipt.id,
			send_to: 'DC-6355556/wpsal0/purch00+transactions',
		} );
	}
}

/**
 * Records an order in Facebook (a single event for the entire order)
 */
function recordOrderInFacebook( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'facebook' ) ) {
		return;
	}

	const currentUser = getCurrentUser();

	// WPCom
	if ( receiptInfo.containsWpcomItems ) {
		if ( null !== receiptInfo.wpcomCostUSD && receiptInfo.wpcomCostUSD > 0 ) {
			// This gives us the billing frequency as a string, and combines yearly and multi-yearly into one bucket.
			// Due to tracking-constraints in Facebook, this is needed. But we also supply the bill_period separately
			// as this is used for other tracking purposes in Facebook.
			const getFrequencyTypeForItem = ( item: ReceiptItem ) => {
				switch ( getReceiptItemBillPeriod( item ) ) {
					case '31':
						return 'monthly';
					case '365':
					case '730':
					case '1095':
						return 'yearly_or_higher';
					default:
						return 'other';
				}
			};
			const cartItemsArray = receiptInfo.wpcomItems.map( ( item ) => {
				return {
					product_slug: item.wpcom_product_slug,
					id: item.product_id,
					product_name: getReceiptItemName( item ),
					bill_period: getReceiptItemBillPeriod( item ),
					billing_frequency: getFrequencyTypeForItem( item ),
					is_sale_coupon_applied: isSaleCouponAppliedToReceiptItem( item ),
					is_bundled: item.uses_free_domain_credit,
					is_domain_registration: item.is_domain_registration,
					is_plan: item.is_plan,
					value: costToUSD( getReceiptItemCost( item, receipt.currency ), receipt.currency ) ?? 0,
					quantity: item.volume,
				};
			} );
			const params = [
				'trackSingle', // Allows sending to a single pixel when multiple are loaded on the page.
				TRACKING_IDS.facebookInit,
				'Purchase',
				{
					contents: cartItemsArray.length > 0 ? cartItemsArray : [],
					content_type: 'product',
					product_slug: receiptInfo.wpcomItems
						.map( ( item ) => item.wpcom_product_slug )
						.join( ', ' ),
					value: receiptInfo.wpcomCostUSD,
					currency: 'USD',
					user_id: currentUser ? currentUser.hashedPii.ID : 0,
					order_id: receipt.id,
				},
			];
			debug( 'recordOrderInFacebook: WPCom', params );
			window.fbq( ...params );
		}
	}

	// Jetpack
	if ( receiptInfo.containsJetpackItems ) {
		if ( null !== receiptInfo.jetpackCostUSD && receiptInfo.jetpackCostUSD > 0 ) {
			const params = [
				'trackSingle',
				TRACKING_IDS.facebookJetpackInit,
				'Purchase',
				{
					product_slug: receiptInfo.jetpackItems
						.map( ( item ) => item.wpcom_product_slug )
						.join( ', ' ),
					value: receiptInfo.jetpackCostUSD,
					currency: 'USD',
					user_id: currentUser ? currentUser.hashedPii.ID : 0,
					order_id: receipt.id,
				},
			];
			debug( 'recordOrderInFacebook: Jetpack', params );
			window.fbq( ...params );
		}
	}

	// Akismet
	if ( receiptInfo.containsAkismetItems ) {
		if ( null !== receiptInfo.akismetCostUSD && receiptInfo.akismetCostUSD > 0 ) {
			const params = [
				'trackSingle',
				TRACKING_IDS.facebookAkismetInit,
				'Purchase',
				{
					product_slug: receiptInfo.akismetItems
						.map( ( item ) => item.wpcom_product_slug )
						.join( ', ' ),
					value: receiptInfo.akismetCostUSD,
					currency: 'USD',
					user_id: currentUser ? currentUser.hashedPii.ID : 0,
					order_id: receipt.id,
				},
			];
			debug( 'recordOrderInFacebook: Akismet', params );
			window.fbq( ...params );
		}
	}
}

/**
 * Records a signup|purchase in Bing.
 */
function recordOrderInBing( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	// NOTE: `receipt.id` is not used at this time, but it could be useful in the near future.

	if ( ! mayWeTrackByTracker( 'bing' ) ) {
		return;
	}

	if ( receiptInfo.containsWpcomItems ) {
		if ( null !== receiptInfo.wpcomCostUSD ) {
			const params = {
				event_category: 'purchase',
				event_label: 'purchase',
				revenue_value: receiptInfo.wpcomCostUSD,
				currency: 'USD',
			};

			debug( 'recordOrderInBing: record WPCom purchase', params );
			window.uetq.push( 'event', 'purchase', params );
		} else {
			debug(
				`recordOrderInBing: currency ${ receipt.currency } not supported, dropping WPCom pixel`
			);
		}
	}

	if ( receiptInfo.containsJetpackItems ) {
		if ( null !== receiptInfo.jetpackCostUSD ) {
			const params = {
				ec: 'purchase',
				gv: receiptInfo.jetpackCostUSD,
				// NOTE: `el` must be included only for jetpack plans.
				el: 'jetpack',
			};
			debug( 'recordOrderInBing: record Jetpack purchase', params );
			window.uetq.push( params );
		} else {
			debug(
				`recordOrderInBing: currency ${ receipt.currency } not supported, dropping Jetpack pixel`
			);
		}
	}
}

/**
 * Records an order/sign_up in Google Ads Gtag
 */
function recordOrderInGoogleAds( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'googleAds' ) ) {
		debug( 'recordOrderInGoogleAds: skipping as ad tracking is disallowed' );
		return;
	}

	// MCC-level event.
	// WPCOM
	if ( mayWeTrackByTracker( 'googleAds' ) ) {
		const currentUser = getCurrentUser();

		// SHA256 hash of current user's email address for enhanced conversion matching.
		const currentUserHashedEmail = currentUser?.hashedPii?.email ?? '';

		window.gtag( 'set', 'user_data', {
			sha256_email_address: currentUserHashedEmail,
		} );

		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
				value: getReceiptTotal( receipt ),
				currency: receipt.currency,
				transaction_id: receipt.id,
			},
		];
		debug( 'recordOrderInGoogleAds: Record WPCom Purchase', params );
		window.gtag( ...params );
	}

	// Jetpack
	if ( mayWeTrackByTracker( 'googleAds' ) && receiptInfo.containsJetpackItems ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.jetpackGoogleAdsGtagPurchase,
				value: receiptInfo.jetpackCost,
				currency: receipt.currency,
				transaction_id: receipt.id,
			},
		];
		debug( 'recordOrderInGoogleAds: Record Jetpack Purchase', params );
		window.gtag( ...params );
	}
}

/**
 * Records an order in the Jetpack.com GA4 Property
 */
function recordOrderInJetpackGA( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'ga' ) ) {
		return;
	}

	if ( receiptInfo.containsJetpackItems ) {
		fireEcommercePurchaseGA4(
			receiptToGaPurchase( receipt, receiptInfo ),
			Ga4PropertyGtag.JETPACK
		);
	}
}

/**
 * Records an order in the Akismet.com GA4 Property
 */
function recordOrderInAkismetGA( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'ga' ) ) {
		return;
	}

	if ( receiptInfo.containsAkismetItems ) {
		fireEcommercePurchaseGA4(
			receiptToGaPurchase( receipt, receiptInfo ),
			Ga4PropertyGtag.AKISMET
		);
	}
}

/**
 * Records an order in the WordPress.com GA4 Property
 */
function recordOrderInWPcomGA4( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'ga' ) ) {
		return;
	}

	if ( ! receiptInfo.containsWpcomItems && ! receiptInfo.containsJetpackItems ) {
		debug( 'recordOrderInWPcomGA4: [Skipping] No products' );
		return;
	}
	// Firing both Jetpack and WPcom Purchases on WPcom (similar to enhanced ecommerce in UA).
	fireEcommercePurchaseGA4( receiptToGaPurchase( receipt, receiptInfo ), Ga4PropertyGtag.WPCOM );
	debug( 'recordOrderInWPcomGA4: Record WPcom Purchase in GA4' );
}

/**
 * Sends a purchase event to Google Tag Manager for Akismet purchases.
 */
function recordOrderInAkismetGTM( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( receiptInfo.containsAkismetItems ) {
		// We ensure that we can track with GTM
		if ( ! mayWeTrackByTracker( 'googleTagManager' ) ) {
			return;
		}

		const purchaseEventMeta = {
			event: 'purchase',
			ecommerce: {
				coupon: getReceiptCouponCode( receipt ),
				transaction_id: receipt.id,
				currency: 'USD',
				items: receiptInfo.akismetItems.map( ( item ) => ( {
					id: item.product_id.toString(),
					name: getReceiptItemName( item ),
					quantity: item.volume,
					price: costToUSD( getReceiptItemCost( item, receipt.currency ), receipt.currency ) ?? 0,
					billing_term: item.months_per_renewal_interval === 12 ? 'yearly' : 'monthly',
				} ) ),
				value: receiptInfo.akismetCostUSD,
			},
		};

		window.dataLayer.push( purchaseEventMeta );

		debug( 'recordOrderInAkismetGTM: Record Akismet GTM purchase', purchaseEventMeta );
	}
}

/**
 * Sends a purchase event to Google Tag Manager for Jetpack purchases.
 */
function recordOrderInJetpackGTM( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( receiptInfo.containsJetpackItems ) {
		// We ensure that we can track with GTM
		if ( ! mayWeTrackByTracker( 'googleTagManager' ) ) {
			return;
		}

		const purchaseEventMeta = {
			event: 'purchase',
			ecommerce: {
				coupon: getReceiptCouponCode( receipt ),
				transaction_id: receipt.id,
				currency: 'USD',
				items: receiptInfo.jetpackItems.map( ( item ) => ( {
					id: item.product_id.toString(),
					name: getReceiptItemName( item ),
					quantity: item.volume,
					price: costToUSD( getReceiptItemCost( item, receipt.currency ), receipt.currency ) ?? 0,
					billing_term: item.months_per_renewal_interval === 12 ? 'yearly' : 'monthly',
				} ) ),
				value: receiptInfo.jetpackCostUSD,
			},
		};

		window.dataLayer.push( purchaseEventMeta );

		debug( 'recordOrderInJetpackGTM: Record Jetpack GTM purchase', purchaseEventMeta );
	}
}

/**
 * Sends a purchase conversion event to Prasely.
 */
function recordOrderInParsely( receiptInfo: WpcomJetpackCartInfo ): void {
	if ( ! mayWeTrackByTracker( 'parsely' ) ) {
		return;
	}

	if ( ! receiptInfo.containsWpcomItems ) {
		return;
	}

	const cartContents = receiptInfo.wpcomItems
		.map( ( item ) => item.wpcom_product_slug )
		.join( ', ' );

	loadParselyTracker()
		.then( () => {
			debug( `loadParselyTracker: Loaded Parsely tracker ${ TRACKING_IDS.parselyTracker }` );
			//eslint-disable-next-line @typescript-eslint/no-unused-expressions
			window.PARSELY && window.PARSELY.conversions.trackPurchase( cartContents );
		} )
		.then( () => {
			debug( 'recordOrderInParsely: Record Parsely purchase', cartContents );
		} )
		.catch( ( error ) => {
			debug( 'recordOrderInParsely: Error loading Parsely', error );
		} );
}
/**
 * Sends a purchase event to Reddit Ads for WPcom purchases.
 */
function recordOrderInReddit( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}

	if ( ! receiptInfo.containsWpcomItems ) {
		return;
	}

	const cartContents = receiptInfo.wpcomItems.map( ( item ) => ( {
		id: item.product_id,
		name: item.product_name_en,
		category: item.product_type,
	} ) );

	const params = {
		value: receiptInfo.wpcomCostUSD,
		currency: 'USD',
		transactionId: receipt.id,
		products: cartContents,
		itemCount: cartContents.length,
	};

	debug( 'recordOrderInReddit:', 'track', params );
	window.rdt( 'track', 'Purchase', params );
}
function recordOrderInTikTok( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'tiktok' ) ) {
		return;
	}
	if ( ! receiptInfo.containsWpcomItems ) {
		return;
	}
	const params = {
		contents: receiptInfo.wpcomItems.map( ( item ) => ( {
			content_id: item.wpcom_product_slug,
			content_name: item.product_name_en,
			content_type: 'product',
		} ) ),
		value: receiptInfo.wpcomCostUSD,
		currency: 'USD',
	};
	debug( 'recordOrderInTikTok:', 'track', params );
	window.ttq.track( 'Purchase', params );
}

function recordOrderInOpenAI( receipt: Receipt, receiptInfo: WpcomJetpackReceiptInfo ): void {
	if ( ! mayWeTrackByTracker( 'openai' ) ) {
		return;
	}
	if ( ! receiptInfo.containsWpcomItems ) {
		return;
	}
	const params = {
		type: 'contents',
		contents: receiptInfo.wpcomItems.map( ( item ) => ( {
			id: item.wpcom_product_slug,
			name: item.product_name_en,
			content_type: 'product',
			quantity: 1,
		} ) ),
		amount: Math.round( Number( receiptInfo.wpcomCostUSD ) * 100 ),
		currency: 'USD',
	};
	debug( 'recordOrderInOpenAI:', 'track', params );
	window.oaiq( 'measure', 'order_created', params );
}

/**
 * Sends a purchase event to Google Tag Manager for eligible Woo Express upgrades.
 */
function recordOrderInWooGTM( receipt: Receipt ): void {
	if ( ! isWooExpressUpgrade( receipt ) ) {
		return;
	}

	loadGTMContainer( TRACKING_IDS.wooGoogleTagManagerId )
		.then( () => initGTMContainer() )
		.then( () => {
			debug(
				`recordOrderInWooGTM: Initialized GTM container ${ TRACKING_IDS.wooGoogleTagManagerId }`
			);

			// We ensure that we can track with GTM
			if ( ! mayWeTrackByTracker( 'googleTagManager' ) ) {
				return;
			}

			const purchaseEventMeta = {
				event: 'purchase',
				ecommerce: {
					coupon: getReceiptCouponCode( receipt ),
					transaction_id: receipt.id,
					currency: 'USD',
					items: receipt.items.map( ( item ) => ( {
						id: item.product_id.toString(),
						name: getReceiptItemName( item ),
						quantity: item.volume,
						price: costToUSD( getReceiptItemCost( item, receipt.currency ), receipt.currency ) ?? 0,
					} ) ),
					value: costToUSD( getReceiptTotal( receipt ), receipt.currency ),
				},
			};

			window.dataLayer.push( purchaseEventMeta );

			debug( 'recordOrderInWooGTM: Record Woo GTM purchase', purchaseEventMeta );
		} )
		.catch( ( error ) => {
			debug( 'recordOrderInWooGTM: Error loading GTM container', error );
		} );
}

/**
 * Records an order in Criteo
 */
function recordOrderInCriteo( receipt: Receipt ): void {
	if ( ! mayWeTrackByTracker( 'criteo' ) ) {
		return;
	}

	// @TODO Separate WPCOM from Jetpack events.
	const params = {
		id: receipt.id,
		currency: receipt.currency,
		item: receiptToCriteoItems( receipt ),
	};
	debug( 'recordOrderInCriteo:', 'trackTransaction', params );
	recordInCriteo( 'trackTransaction', params );
}
