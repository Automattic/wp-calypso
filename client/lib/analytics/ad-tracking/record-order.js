/**
 * Internal dependencies
 */
import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import {
	costToUSD,
	isAdTrackingAllowed,
	refreshCountryCodeCookieGdpr,
} from 'calypso/lib/analytics/utils';
import {
	debug,
	isCriteoEnabled,
	isFacebookEnabled,
	isBingEnabled,
	isQuantcastEnabled,
	isWpcomGoogleAdsGtagEnabled,
	isFloodlightEnabled,
	isTwitterEnabled,
	isPinterestEnabled,
	isIconMediaEnabled,
	isExperianEnabled,
	isGeminiEnabled,
	isPandoraEnabled,
	isQuoraEnabled,
	isAdRollEnabled,
	isGoogleAnalyticsEnabled,
	isGoogleAnalyticsEnhancedEcommerceEnabled,
	TRACKING_IDS,
	EXPERIAN_CONVERSION_PIXEL_URL,
	YAHOO_GEMINI_CONVERSION_PIXEL_URL,
	PANDORA_CONVERSION_PIXEL_URL,
	ICON_MEDIA_ORDER_PIXEL_URL,
	GA_PRODUCT_BRAND_WPCOM,
	GA_PRODUCT_BRAND_JETPACK,
} from './constants';
import { loadTrackingScripts } from './load-tracking-scripts';
import { recordParamsInFloodlightGtag } from './floodlight';
import { cartToCriteoItems, recordInCriteo } from './criteo';
import { getCurrentUser } from '@automattic/calypso-analytics';

// Ensure setup has run.
import './setup';

/**
 * Tracks a purchase conversion
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {number} orderId - the order id
 * @returns {void}
 */
export async function recordOrder( cart, orderId ) {
	await refreshCountryCodeCookieGdpr();

	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordOrder: [Skipping] ad tracking is not allowed' );
		return;
	}

	await loadTrackingScripts();

	if ( cart.is_signup ) {
		return;
	}

	if ( cart.total_cost < 0.01 ) {
		debug( 'recordOrder: [Skipping] total cart cost is less than 0.01' );
		return;
	}

	const usdTotalCost = costToUSD( cart.total_cost, cart.currency );

	// Purchase tracking happens in one of three ways:

	// Fire one tracking event that includes details about the entire order

	const wpcomJetpackCartInfo = splitWpcomJetpackCartInfo( cart );
	debug( 'recordOrder: wpcomJetpackCartInfo:', wpcomJetpackCartInfo );

	recordOrderInGoogleAds( cart, orderId );
	recordOrderInFacebook( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInFloodlight( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInBing( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInQuantcast( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInCriteo( cart, orderId );
	recordOrderInGAEnhancedEcommerce( cart, orderId, wpcomJetpackCartInfo );

	// Fire a single tracking event without any details about what was purchased

	// Experian / One 2 One Media
	if ( isExperianEnabled ) {
		debug( 'recordOrder: [Experian]', EXPERIAN_CONVERSION_PIXEL_URL );
		new window.Image().src = EXPERIAN_CONVERSION_PIXEL_URL;
	}

	// Yahoo Gemini
	if ( isGeminiEnabled ) {
		const params =
			YAHOO_GEMINI_CONVERSION_PIXEL_URL + ( usdTotalCost !== null ? '&gv=' + usdTotalCost : '' );
		debug( 'recordOrder: [Yahoo Gemini]', params );
		new window.Image().src = params;
	}

	if ( isPandoraEnabled ) {
		debug( 'recordOrder: [Pandora]', PANDORA_CONVERSION_PIXEL_URL );
		new window.Image().src = PANDORA_CONVERSION_PIXEL_URL;
	}

	if ( isQuoraEnabled ) {
		const params = [ 'track', 'Generic' ];
		debug( 'recordOrder: [Quora]', params );
		window.qp( ...params );
	}

	if ( isIconMediaEnabled ) {
		const skus = cart.products.map( ( product ) => product.product_slug ).join( ',' );
		const params =
			ICON_MEDIA_ORDER_PIXEL_URL + `&tx=${ orderId }&sku=${ skus }&price=${ usdTotalCost }`;
		debug( 'recordOrder: [Icon Media]', params );
		new window.Image().src = params;
	}

	// Twitter
	if ( isTwitterEnabled ) {
		const params = [
			'track',
			'Purchase',
			{
				value: cart.total_cost.toString(),
				currency: cart.currency,
				content_name: cart.products.map( ( product ) => product.product_name ).join( ',' ),
				content_type: 'product',
				content_ids: cart.products.map( ( product ) => product.product_slug ),
				num_items: cart.products.length,
				order_id: orderId,
			},
		];
		debug( 'recordOrder: [Twitter]', params );
		window.twq( ...params );
	}

	// Pinterest
	if ( isPinterestEnabled ) {
		const params = [
			'track',
			'checkout',
			{
				value: cart.total_cost,
				currency: cart.currency,
				line_items: cart.products.map( ( product ) => ( {
					product_name: product.product_name,
					product_id: product.product_slug,
					product_price: product.price,
				} ) ),
				order_id: orderId,
			},
		];
		debug( 'recordOrder: [Pinterest]', params );
		window.pintrk( ...params );
	}

	// AdRoll
	if ( isAdRollEnabled ) {
		debug( 'recordOrder: [AdRoll]' );
		window.adRoll.trackPurchase();
	}

	// Uses JSON.stringify() to print the expanded object because during localhost or .live testing after firing this
	// event we redirect the user to wordpress.com which causes a domain change preventing the expanding and inspection
	// of any object in the JS console since they are no longer available.
	debug( 'recordOrder: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
}

function splitWpcomJetpackCartInfo( cart ) {
	const jetpackCost = cart.products
		.map( ( product ) =>
			isJetpackPlan( product ) || isJetpackProduct( product ) ? product.cost : 0
		)
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );
	const wpcomCost = cart.total_cost - jetpackCost;
	const wpcomProducts = cart.products.filter(
		( product ) => ! isJetpackPlan( product ) && ! isJetpackProduct( product )
	);
	const jetpackProducts = cart.products.filter(
		( product ) => isJetpackPlan( product ) || isJetpackProduct( product )
	);

	return {
		wpcomProducts: wpcomProducts,
		jetpackProducts: jetpackProducts,
		containsWpcomProducts: 0 !== wpcomProducts.length,
		containsJetpackProducts: 0 !== jetpackProducts.length,
		jetpackCost: jetpackCost,
		wpcomCost: wpcomCost,
		jetpackCostUSD: costToUSD( jetpackCost, cart.currency ),
		wpcomCostUSD: costToUSD( wpcomCost, cart.currency ),
		totalCostUSD: costToUSD( cart.total_cost, cart.currency ),
	};
}

/**
 * Records an order in Quantcast
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {number} orderId - the order id
 * @param {object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInQuantcast( cart, orderId, wpcomJetpackCartInfo ) {
	if ( ! isAdTrackingAllowed() || ! isQuantcastEnabled ) {
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
				orderid: orderId.toString(),
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
				orderid: orderId.toString(),
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
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {number} orderId - the order id
 * @param {object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInFloodlight( cart, orderId, wpcomJetpackCartInfo ) {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
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
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {number} orderId - the order id
 * @param {object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInFacebook( cart, orderId, wpcomJetpackCartInfo ) {
	if ( ! isAdTrackingAllowed() || ! isFacebookEnabled ) {
		return;
	}

	const currentUser = getCurrentUser();

	// WPCom
	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		if ( null !== wpcomJetpackCartInfo.wpcomCostUSD && wpcomJetpackCartInfo.wpcomCostUSD > 0 ) {
			const params = [
				'trackSingle',
				TRACKING_IDS.facebookInit,
				'Purchase',
				{
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
}

/**
 * Records a signup|purchase in Bing.
 *
 * @param {object} cart - cart as `CartValue` object.
 * @param {number} orderId - the order ID.
 * @param {object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInBing( cart, orderId, wpcomJetpackCartInfo ) {
	// NOTE: `orderId` is not used at this time, but it could be useful in the near future.

	if ( ! isAdTrackingAllowed() || ! isBingEnabled ) {
		return;
	}

	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		if ( null !== wpcomJetpackCartInfo.wpcomCostUSD ) {
			const params = {
				ec: 'purchase',
				gv: wpcomJetpackCartInfo.wpcomCostUSD,
			};
			debug( 'recordOrderInBing: record WPCom purchase', params );
			window.uetq.push( params );
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
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {number} orderId - the order id
 * @returns {void}
 */
function recordOrderInGoogleAds( cart, orderId ) {
	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordOrderInGoogleAds: skipping as ad tracking is disallowed' );
		return;
	}

	// MCC-level event.
	// @TODO Separate WPCOM from Jetpack events.
	if ( isWpcomGoogleAdsGtagEnabled ) {
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
}

function recordOrderInGAEnhancedEcommerce( cart, orderId, wpcomJetpackCartInfo ) {
	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordOrderInGAEnhancedEcommerce: [Skipping] ad tracking is disallowed' );
		return;
	}

	if ( ! isGoogleAnalyticsEnabled || ! isGoogleAnalyticsEnhancedEcommerceEnabled ) {
		debug( 'recordOrderInGAEnhancedEcommerce: [Skipping] Google Analytics is not enabled' );
		return;
	}

	let products;
	let brand;
	let totalCostUSD;

	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		products = wpcomJetpackCartInfo.wpcomProducts;
		brand = GA_PRODUCT_BRAND_WPCOM;
		totalCostUSD = wpcomJetpackCartInfo.wpcomCostUSD;
	} else if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		products = wpcomJetpackCartInfo.jetpackProducts;
		brand = GA_PRODUCT_BRAND_JETPACK;
		totalCostUSD = wpcomJetpackCartInfo.jetpackCostUSD;
	} else {
		debug( 'recordOrderInGAEnhancedEcommerce: [Skipping] No products' );
		return;
	}

	const items = [];
	products.map( ( product ) => {
		items.push( {
			id: product.product_id.toString(),
			name: product.product_name_en.toString(),
			quantity: parseInt( product.volume ),
			price: ( costToUSD( product.cost, cart.currency ) ?? '' ).toString(),
			brand,
		} );
	} );

	const params = [
		'event',
		'purchase',
		{
			transaction_id: orderId.toString(),
			value: parseFloat( totalCostUSD ),
			currency: 'USD',
			tax: parseFloat( cart.total_tax ?? 0 ),
			coupon: cart.coupon_code?.toString() ?? '',
			affiliation: brand,
			items,
		},
	];

	window.gtag( ...params );

	debug( 'recordOrderInGAEnhancedEcommerce: Record WPCom Purchase', params );
}

/**
 * Records an order in Criteo
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {number} orderId - the order id
 * @returns {void}
 */
function recordOrderInCriteo( cart, orderId ) {
	if ( ! isAdTrackingAllowed() || ! isCriteoEnabled ) {
		return;
	}

	// @TODO Separate WPCOM from Jetpack events.
	const params = [
		'trackTransaction',
		{
			id: orderId,
			currency: cart.currency,
			item: cartToCriteoItems( cart ),
		},
	];
	debug( 'recordOrderInCriteo:', params );
	recordInCriteo( ...params );
}
