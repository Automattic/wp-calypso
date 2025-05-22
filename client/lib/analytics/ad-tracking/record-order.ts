import { getCurrentUser } from '@automattic/calypso-analytics';
import { isPlan } from '@automattic/calypso-products';
import { costToUSD, refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker } from '../tracker-buckets';
import { cartToGaPurchase } from '../utils/cart-to-ga-purchase';
import { splitCartProducts } from '../utils/split-wpcom-jetpack-cart-info';
import {
	debug,
	TRACKING_IDS,
	EXPERIAN_CONVERSION_PIXEL_URL,
	YAHOO_GEMINI_CONVERSION_PIXEL_URL,
	PANDORA_CONVERSION_PIXEL_URL,
	ICON_MEDIA_ORDER_PIXEL_URL,
} from './constants';
import { cartToCriteoItems, recordInCriteo } from './criteo';
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
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import type { WpcomJetpackCartInfo } from 'calypso/lib/analytics/utils/split-wpcom-jetpack-cart-info';

// Ensure setup has run.
import './setup';

declare global {
	interface Window {
		qp: ( ...args: string[] ) => void;
		twq: ( ...args: any[] ) => void;
		fbq: ( ...args: any[] ) => void;
		gtag: ( ...args: any[] ) => void;
		pintrk: ( ...args: any[] ) => void;
		adRoll: { trackPurchase: () => void };
		lintrk: ( key: string, val: Record< string, any > ) => void;
		_qevents: any[];
		uetq: any[];
		rdt: any[] & { ( ...args: any[] ): void };
	}
}

/**
 * Tracks a purchase conversion
 */
export async function recordOrder(
	cart: ResponseCart,
	orderId: number | null | undefined,
	sitePlanSlug: string | null | undefined
): Promise< void > {
	await refreshCountryCodeCookieGdpr();

	await loadTrackingScripts();

	if ( cart.is_signup ) {
		return;
	}

	const usdTotalCost = costToUSD( cart.total_cost, cart.currency );

	// Purchase tracking happens in one of three ways:

	// Fire one tracking event that includes details about the entire order

	const wpcomJetpackCartInfo = splitCartProducts( cart );
	debug( 'recordOrder: wpcomJetpackCartInfo:', wpcomJetpackCartInfo );

	recordOrderInGoogleAds( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInFacebook( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInFloodlight( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInBing( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInQuantcast( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInCriteo( cart, orderId );
	recordOrderInJetpackGA( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInWPcomGA4( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInParsely( wpcomJetpackCartInfo );
	recordOrderInAkismetGA( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInWooGTM( cart, orderId, sitePlanSlug );
	recordOrderInAkismetGTM( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInJetpackGTM( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInReddit( orderId, wpcomJetpackCartInfo );

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
		const params = [ 'track', 'Generic' ];
		debug( 'recordOrder: [Quora]', params );
		window.qp( ...params );
	}

	if ( mayWeTrackByTracker( 'iconMedia' ) ) {
		const skus = cart.products.map( ( product ) => product.product_slug ).join( ',' );
		const params =
			ICON_MEDIA_ORDER_PIXEL_URL + `&tx=${ orderId }&sku=${ skus }&price=${ usdTotalCost }`;
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
				value: cart.total_cost,
				currency: cart.currency,
				line_items: cart.products.map( ( product ) => ( {
					product_name: product.product_name,
					product_id: product.product_slug,
				} ) ),
				order_id: orderId,
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

	if ( mayWeTrackByTracker( 'linkedin' ) && wpcomJetpackCartInfo.containsJetpackProducts ) {
		const params = { conversion_id: 10947410 };

		debug( 'recordOrder: [LinkedIn]', params );
		window.lintrk( 'track', params );
	}

	if ( mayWeTrackByTracker( 'linkedin' ) && wpcomJetpackCartInfo.containsWpcomProducts ) {
		const params = { conversion_id: 19839620 };

		debug( 'recordOrder: [LinkedIn]', params );
		window.lintrk( 'track', params );
	}

	if ( mayWeTrackByTracker( 'twitter' ) && wpcomJetpackCartInfo.containsJetpackProducts ) {
		const params = [ 'event', 'tw-odlje-oekzo', { value: wpcomJetpackCartInfo.jetpackCostUSD } ];
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
function recordOrderInQuantcast(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( ! mayWeTrackByTracker( 'quantcast' ) ) {
		return;
	}

	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		if ( null !== wpcomJetpackCartInfo.wpcomCostUSD ) {
			// Note that all properties have to be strings or they won't get tracked
			const params = {
				qacct: TRACKING_IDS.quantcast,
				labels:
					'_fp.event.Purchase Confirmation,_fp.pcat.' +
					wpcomJetpackCartInfo.wpcomProducts.map( ( product ) => product.product_slug ).join( ' ' ),
				orderid: orderId?.toString(),
				revenue: wpcomJetpackCartInfo.wpcomCostUSD.toString(),
				event: 'refresh',
			};
			debug( 'recordOrderInQuantcast: record WPCom purchase', params );
			window._qevents.push( params );
		} else {
			debug(
				`recordOrderInQuantcast: currency ${ cart.currency } not supported, dropping WPCom pixel`
			);
		}
	}

	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		if ( null !== wpcomJetpackCartInfo.jetpackCostUSD ) {
			// Note that all properties have to be strings or they won't get tracked
			const params = {
				qacct: TRACKING_IDS.quantcast,
				labels:
					'_fp.event.Purchase Confirmation,_fp.pcat.' +
					wpcomJetpackCartInfo.jetpackProducts
						.map( ( product ) => product.product_slug )
						.join( ' ' ),
				orderid: orderId?.toString(),
				revenue: wpcomJetpackCartInfo.jetpackCostUSD.toString(),
				event: 'refresh',
			};
			debug( 'recordOrderInQuantcast: record Jetpack purchase', params );
			window._qevents.push( params );
		} else {
			debug(
				`recordOrderInQuantcast: currency ${ cart.currency } not supported, dropping Jetpack pixel`
			);
		}
	}
}

/**
 * Records an order in DCM Floodlight
 */
function recordOrderInFloodlight(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( ! mayWeTrackByTracker( 'floodlight' ) ) {
		return;
	}

	debug( 'recordOrderInFloodlight: record purchase' );

	debug( 'recordOrderInFloodlight:' );
	recordParamsInFloodlightGtag( {
		value: wpcomJetpackCartInfo.totalCostUSD,
		transaction_id: orderId,
		u1: wpcomJetpackCartInfo.totalCostUSD,
		u2: cart.products.map( ( product ) => product.product_name ).join( ', ' ),
		u3: 'USD',
		u8: orderId,
		send_to: 'DC-6355556/wpsal0/wpsale+transactions',
	} );

	// WPCom
	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		debug( 'recordOrderInFloodlight: WPCom' );
		recordParamsInFloodlightGtag( {
			value: wpcomJetpackCartInfo.wpcomCostUSD,
			transaction_id: orderId,
			u1: wpcomJetpackCartInfo.wpcomCostUSD,
			u2: wpcomJetpackCartInfo.wpcomProducts
				.map( ( product ) => product.product_name )
				.join( ', ' ),
			u3: 'USD',
			u8: orderId,
			send_to: 'DC-6355556/wpsal0/purch0+transactions',
		} );
	}

	// Jetpack
	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		debug( 'recordOrderInFloodlight: Jetpack' );
		recordParamsInFloodlightGtag( {
			value: wpcomJetpackCartInfo.jetpackCostUSD,
			transaction_id: orderId,
			u1: wpcomJetpackCartInfo.jetpackCostUSD,
			u2: wpcomJetpackCartInfo.jetpackProducts
				.map( ( product ) => product.product_name )
				.join( ', ' ),
			u3: 'USD',
			u8: orderId,
			send_to: 'DC-6355556/wpsal0/purch00+transactions',
		} );
	}
}

/**
 * Records an order in Facebook (a single event for the entire order)
 */
function recordOrderInFacebook(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( ! mayWeTrackByTracker( 'facebook' ) ) {
		return;
	}

	const currentUser = getCurrentUser();

	// WPCom
	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		if ( null !== wpcomJetpackCartInfo.wpcomCostUSD && wpcomJetpackCartInfo.wpcomCostUSD > 0 ) {
			// This gives us the billing frequency as a string, and combines yearly and multi-yearly into one bucket.
			// Due to tracking-constraints in Facebook, this is needed. But we also supply the bill_period separately
			// as this is used for other tracking purposes in Facebook.
			const getFrequencyTypeForProduct = ( product: ResponseCartProduct ) => {
				switch ( product.bill_period ) {
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
			const cartItemsArray = wpcomJetpackCartInfo.wpcomProducts.map( ( product ) => {
				return {
					product_slug: product.product_slug ?? '',
					id: product.product_id ?? '',
					product_name: product.product_name ?? '',
					bill_period: product.bill_period ?? 0,
					billing_frequency: getFrequencyTypeForProduct( product ),
					is_sale_coupon_applied: product.is_sale_coupon_applied ?? false,
					is_bundled: product.is_bundled ?? false,
					is_domain_registration: product.is_domain_registration ?? false,
					is_plan: isPlan( product ) ?? false,
					value: costToUSD( product.cost, product.currency ) ?? 0,
					quantity: product.volume ?? 1,
				};
			} );
			const params = [
				'trackSingle', // Allows sending to a single pixel when multiple are loaded on the page.
				TRACKING_IDS.facebookInit,
				'Purchase',
				{
					contents: cartItemsArray.length > 0 ? cartItemsArray : [],
					content_type: 'product',
					product_slug: wpcomJetpackCartInfo.wpcomProducts
						.map( ( product ) => product.product_slug )
						.join( ', ' ),
					value: wpcomJetpackCartInfo.wpcomCostUSD,
					currency: 'USD',
					user_id: currentUser ? currentUser.hashedPii.ID : 0,
					order_id: orderId,
				},
			];
			debug( 'recordOrderInFacebook: WPCom', params );
			window.fbq( ...params );
		}
	}

	// Jetpack
	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		if ( null !== wpcomJetpackCartInfo.jetpackCostUSD && wpcomJetpackCartInfo.jetpackCostUSD > 0 ) {
			const params = [
				'trackSingle',
				TRACKING_IDS.facebookJetpackInit,
				'Purchase',
				{
					product_slug: wpcomJetpackCartInfo.jetpackProducts
						.map( ( product ) => product.product_slug )
						.join( ', ' ),
					value: wpcomJetpackCartInfo.jetpackCostUSD,
					currency: 'USD',
					user_id: currentUser ? currentUser.hashedPii.ID : 0,
					order_id: orderId,
				},
			];
			debug( 'recordOrderInFacebook: Jetpack', params );
			window.fbq( ...params );
		}
	}

	// Akismet
	if ( wpcomJetpackCartInfo.containsAkismetProducts ) {
		if ( null !== wpcomJetpackCartInfo.akismetCostUSD && wpcomJetpackCartInfo.akismetCostUSD > 0 ) {
			const params = [
				'trackSingle',
				TRACKING_IDS.facebookAkismetInit,
				'Purchase',
				{
					product_slug: wpcomJetpackCartInfo.akismetProducts
						.map( ( product ) => product.product_slug )
						.join( ', ' ),
					value: wpcomJetpackCartInfo.akismetCostUSD,
					currency: 'USD',
					user_id: currentUser ? currentUser.hashedPii.ID : 0,
					order_id: orderId,
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
function recordOrderInBing(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	// NOTE: `orderId` is not used at this time, but it could be useful in the near future.

	if ( ! mayWeTrackByTracker( 'bing' ) ) {
		return;
	}

	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		if ( null !== wpcomJetpackCartInfo.wpcomCostUSD ) {
			const params = {
				event_category: 'purchase',
				event_label: 'purchase',
				revenue_value: wpcomJetpackCartInfo.wpcomCostUSD,
				currency: 'USD',
			};

			debug( 'recordOrderInBing: record WPCom purchase', params );
			window.uetq.push( 'event', 'purchase', params );
		} else {
			debug( `recordOrderInBing: currency ${ cart.currency } not supported, dropping WPCom pixel` );
		}
	}

	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		if ( null !== wpcomJetpackCartInfo.jetpackCostUSD ) {
			const params = {
				ec: 'purchase',
				gv: wpcomJetpackCartInfo.jetpackCostUSD,
				// NOTE: `el` must be included only for jetpack plans.
				el: 'jetpack',
			};
			debug( 'recordOrderInBing: record Jetpack purchase', params );
			window.uetq.push( params );
		} else {
			debug(
				`recordOrderInBing: currency ${ cart.currency } not supported, dropping Jetpack pixel`
			);
		}
	}
}

/**
 * Records an order/sign_up in Google Ads Gtag
 */
function recordOrderInGoogleAds(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
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
				value: cart.total_cost,
				currency: cart.currency,
				transaction_id: orderId,
			},
		];
		debug( 'recordOrderInGoogleAds: Record WPCom Purchase', params );
		window.gtag( ...params );
	}

	// Jetpack
	if ( mayWeTrackByTracker( 'googleAds' ) && wpcomJetpackCartInfo.containsJetpackProducts ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.jetpackGoogleAdsGtagPurchase,
				value: wpcomJetpackCartInfo.jetpackCost,
				currency: cart.currency,
				transaction_id: orderId,
			},
		];
		debug( 'recordOrderInGoogleAds: Record Jetpack Purchase', params );
		window.gtag( ...params );
	}
}

/**
 * Records an order in the Jetpack.com GA4 Property
 */
function recordOrderInJetpackGA(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( ! mayWeTrackByTracker( 'ga' ) ) {
		return;
	}

	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		fireEcommercePurchaseGA4(
			cartToGaPurchase( String( orderId ), cart, wpcomJetpackCartInfo ),
			Ga4PropertyGtag.JETPACK
		);
	}
}

/**
 * Records an order in the Akismet.com GA4 Property
 */
function recordOrderInAkismetGA(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( ! mayWeTrackByTracker( 'ga' ) ) {
		return;
	}

	if ( wpcomJetpackCartInfo.containsAkismetProducts ) {
		fireEcommercePurchaseGA4(
			cartToGaPurchase( String( orderId ), cart, wpcomJetpackCartInfo ),
			Ga4PropertyGtag.AKISMET
		);
	}
}

/**
 * Records an order in the WordPress.com GA4 Property
 */
function recordOrderInWPcomGA4(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( ! mayWeTrackByTracker( 'ga' ) ) {
		return;
	}

	if (
		! wpcomJetpackCartInfo.containsWpcomProducts &&
		! wpcomJetpackCartInfo.containsJetpackProducts
	) {
		debug( 'recordOrderInWPcomGA4: [Skipping] No products' );
		return;
	}
	// Firing both Jetpack and WPcom Purchases on WPcom (similar to enhanced ecommerce in UA).
	fireEcommercePurchaseGA4(
		cartToGaPurchase( String( orderId ), cart, wpcomJetpackCartInfo ),
		Ga4PropertyGtag.WPCOM
	);
	debug( 'recordOrderInWPcomGA4: Record WPcom Purchase in GA4' );
}

/**
 * Sends a purchase event to Google Tag Manager for Akismet purchases.
 */
function recordOrderInAkismetGTM(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( wpcomJetpackCartInfo.containsAkismetProducts ) {
		// We ensure that we can track with GTM
		if ( ! mayWeTrackByTracker( 'googleTagManager' ) ) {
			return;
		}

		const purchaseEventMeta = {
			event: 'purchase',
			ecommerce: {
				coupon: cart.coupon?.toString() ?? '',
				transaction_id: orderId,
				currency: 'USD',
				items: wpcomJetpackCartInfo.akismetProducts.map(
					( { product_id, product_name, cost, volume, bill_period } ) => ( {
						id: product_id.toString(),
						name: product_name.toString(),
						quantity: parseInt( String( volume ) ),
						price: costToUSD( cost, cart.currency ) ?? 0,
						billing_term: bill_period === '365' ? 'yearly' : 'monthly',
					} )
				),
				value: wpcomJetpackCartInfo.akismetCostUSD,
			},
		};

		window.dataLayer.push( purchaseEventMeta );

		debug( 'recordOrderInAkismetGTM: Record Akismet GTM purchase', purchaseEventMeta );
	}
}

/**
 * Sends a purchase event to Google Tag Manager for Jetpack purchases.
 */
function recordOrderInJetpackGTM(
	cart: ResponseCart,
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		// We ensure that we can track with GTM
		if ( ! mayWeTrackByTracker( 'googleTagManager' ) ) {
			return;
		}

		const purchaseEventMeta = {
			event: 'purchase',
			ecommerce: {
				coupon: cart.coupon?.toString() ?? '',
				transaction_id: orderId,
				currency: 'USD',
				items: wpcomJetpackCartInfo.jetpackProducts.map(
					( { product_id, product_name, cost, volume, bill_period } ) => ( {
						id: product_id.toString(),
						name: product_name.toString(),
						quantity: parseInt( String( volume ) ),
						price: costToUSD( cost, cart.currency ) ?? 0,
						billing_term: bill_period === '365' ? 'yearly' : 'monthly',
					} )
				),
				value: wpcomJetpackCartInfo.jetpackCostUSD,
			},
		};

		window.dataLayer.push( purchaseEventMeta );

		debug( 'recordOrderInJetpackGTM: Record Jetpack GTM purchase', purchaseEventMeta );
	}
}

/**
 * Sends a purchase conversion event to Prasely.
 */
function recordOrderInParsely( wpcomJetpackCartInfo: WpcomJetpackCartInfo ): void {
	if ( ! mayWeTrackByTracker( 'parsely' ) ) {
		return;
	}

	if ( ! wpcomJetpackCartInfo.containsWpcomProducts ) {
		return;
	}

	const cartContents = wpcomJetpackCartInfo.wpcomProducts
		.map( ( product ) => product.product_slug )
		.join( ', ' );

	loadParselyTracker()
		.then( () => {
			debug( `loadParselyTracker: Loaded Parsely tracker ${ TRACKING_IDS.parselyTracker }` );
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
function recordOrderInReddit(
	orderId: number | null | undefined,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void {
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}

	if ( ! wpcomJetpackCartInfo.containsWpcomProducts ) {
		return;
	}

	const cartContents = wpcomJetpackCartInfo.wpcomProducts.map( ( product ) => ( {
		id: product.product_id,
		name: product.product_name_en,
		category: product.product_type,
	} ) );

	const params = {
		value: wpcomJetpackCartInfo.wpcomCostUSD,
		currency: 'USD',
		transactionId: orderId,
		products: cartContents,
		itemCount: cartContents.length,
	};

	debug( 'recordOrderInReddit:', 'track', params );
	window.rdt( 'track', 'Purchase', params );
}

/**
 * Sends a purchase event to Google Tag Manager for eligible Woo Express upgrades.
 */
function recordOrderInWooGTM(
	cart: ResponseCart,
	orderId: number | null | undefined,
	sitePlanSlug: string | null | undefined
): void {
	if ( ! isWooExpressUpgrade( cart, sitePlanSlug ?? undefined ) ) {
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
					coupon: cart.coupon?.toString() ?? '',
					transaction_id: orderId,
					currency: 'USD',
					items: cart.products.map( ( { product_id, product_name, cost, volume } ) => ( {
						id: product_id.toString(),
						name: product_name.toString(),
						quantity: parseInt( String( volume ) ),
						price: costToUSD( cost, cart.currency ) ?? 0,
					} ) ),
					value: costToUSD( cart.total_cost_integer / 100, cart.currency ),
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
function recordOrderInCriteo( cart: ResponseCart, orderId: number | null | undefined ): void {
	if ( ! mayWeTrackByTracker( 'criteo' ) ) {
		return;
	}

	// @TODO Separate WPCOM from Jetpack events.
	const params = {
		id: orderId,
		currency: cart.currency,
		item: cartToCriteoItems( cart ),
	};
	debug( 'recordOrderInCriteo:', 'trackTransaction', params );
	recordInCriteo( 'trackTransaction', params );
}
