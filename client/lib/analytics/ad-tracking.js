/** @format */

/**
 * External dependencies
 */

import async from 'async';
import cookie from 'cookie';
import debugFactory from 'debug';
import { assign, clone, cloneDeep, noop } from 'lodash';
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import config from 'config';
import productsValues from 'lib/products-values';
import userModule from 'lib/user';
import { loadScript } from 'lib/load-script';
import { shouldSkipAds } from 'lib/analytics/utils';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:ad-tracking' );
const user = userModule();
let hasStartedFetchingScripts = false,
	hasFinishedFetchingScripts = false;

// Enable/disable ad-tracking
// These should not be put in the json config as they must not differ across environments
const isFloodlightEnabled = true;
const isAdwordsEnabled = true;
const isFacebookEnabled = true;
const isBingEnabled = true;
const isYahooEnabled = true;
const isQuantcastEnabled = true;
const isTwitterEnabled = true;
const isAolEnabled = true;
const isExperianEnabled = true;
const isLinkedinEnabled = true;
let isYandexEnabled = true;
const isOutbrainEnabled = true;
const isCriteoEnabled = false;
const isAtlasEnabled = false;
const isPandoraEnabled = false;
const isQuoraEnabled = false;
const isMediaWallahEnabled = false;

// Retargeting events are fired once every `retargetingPeriod` seconds.
const retargetingPeriod = 60 * 60 * 24;

// Last time the retarget() function effectively fired (Unix time in seconds).
let lastRetargetTime = 0;

// Last time the recordPageViewInFloodlight() function effectively fired (Unix time in seconds).
let lastFloodlightPageViewTime = 0;

/**
 * Constants
 */
const FACEBOOK_TRACKING_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js',
	ATLAS_TRACKING_SCRIPT_URL = 'https://ad.atdmt.com/m/a.js',
	GOOGLE_TRACKING_SCRIPT_URL = 'https://www.googleadservices.com/pagead/conversion_async.js',
	BING_TRACKING_SCRIPT_URL = 'https://bat.bing.com/bat.js',
	CRITEO_TRACKING_SCRIPT_URL = 'https://static.criteo.net/js/ld/ld.js',
	ADWORDS_CONVERSION_ID = config( 'google_adwords_conversion_id' ),
	ADWORDS_CONVERSION_ID_JETPACK = config( 'google_adwords_conversion_id_jetpack' ),
	ONE_BY_AOL_CONVERSION_PIXEL_URL =
		'https://secure.ace-tag.advertising.com/action/type=132958/bins=1/rich=0/Mnum=1516/',
	ONE_BY_AOL_AUDIENCE_BUILDING_PIXEL_URL =
		'https://secure.leadback.advertising.com/adcedge/lb' +
		'?site=695501&betr=sslbet_1472760417=[+]ssprlb_1472760417[720]|sslbet_1472760452=[+]ssprlb_1472760452[8760]',
	PANDORA_CONVERSION_PIXEL_URL =
		'https://data.adxcel-ec2.com/pixel/' +
		'?ad_log=referer&action=purchase&pixid=7efc5994-458b-494f-94b3-31862eee9e26',
	EXPERIAN_CONVERSION_PIXEL_URL =
		'https://d.turn.com/r/dd/id/L21rdC84MTYvY2lkLzE3NDc0MzIzNDgvdC8yL2NhdC8zMjE4NzUwOQ',
	YAHOO_TRACKING_SCRIPT_URL = 'https://s.yimg.com/wi/ytc.js',
	TWITTER_TRACKING_SCRIPT_URL = 'https://static.ads-twitter.com/uwt.js',
	DCM_FLOODLIGHT_IFRAME_URL = 'https://6355556.fls.doubleclick.net/activityi',
	LINKED_IN_SCRIPT_URL = 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
	MEDIA_WALLAH_SCRIPT_URL = 'https://d3ir0rz7vxwgq5.cloudfront.net/mwData.min.js',
	QUORA_SCRIPT_URL = 'https://a.quora.com/qevents.js',
	YANDEX_SCRIPT_URL = 'https://mc.yandex.ru/metrika/watch.js',
	OUTBRAIN_SCRIPT_URL = 'https://amplify.outbrain.com/cp/obtp.js',
	TRACKING_IDS = {
		bingInit: '4074038',
		facebookInit: '823166884443641',
		googleConversionLabel: 'MznpCMGHr2MQ1uXz_AM',
		googleConversionLabelJetpack: '0fwbCL35xGIQqv3svgM',
		atlasUniveralTagId: '11187200770563',
		criteo: '31321',
		quantcast: 'p-3Ma3jHaQMB_bS',
		yahooProjectId: '10000',
		yahooPixelId: '10014088',
		twitterPixelId: 'nvzbs',
		dcmFloodlightAdvertiserId: '6355556',
		linkedInPartnerId: '195308',
		quoraPixelId: '420845cb70e444938cf0728887a74ca1',
		outbrainAdvId: '00f0f5287433c2851cc0cb917c7ff0465e',
	},
	// This name is something we created to store a session id for DCM Floodlight session tracking
	DCM_FLOODLIGHT_SESSION_COOKIE_NAME = 'dcmsid',
	DCM_FLOODLIGHT_SESSION_LENGTH_IN_SECONDS = 1800,
	// For converting other currencies into USD for tracking purposes
	EXCHANGE_RATES = {
		USD: 1,
		EUR: 1,
		JPY: 125,
		AUD: 1.35,
		CAD: 1.35,
		GBP: 0.75,
		BRL: 2.55,
	};

/**
 * Globals
 */

// Facebook
if ( isFacebookEnabled && ! window.fbq ) {
	setUpFacebookGlobal();
}

// Bing
if ( isBingEnabled && ! window.uetq ) {
	window.uetq = [];
}

// Criteo
if ( isCriteoEnabled && ! window.criteo_q ) {
	window.criteo_q = [];
}

// Quantcast
if ( isQuantcastEnabled && ! window._qevents ) {
	window._qevents = [];
}

// Twitter
if ( isTwitterEnabled && ! window.twq ) {
	setUpTwitterGlobal();
}

// Linkedin
if ( isLinkedinEnabled && ! window._linkedin_data_partner_id ) {
	window._linkedin_data_partner_id = TRACKING_IDS.linkedInPartnerId;
}

// Quora
if ( isQuoraEnabled && ! window.qp ) {
	setupQuoraGlobal();
}

// Outbrain
if ( isOutbrainEnabled ) {
	setupOutbrainGlobal();
}

/**
 * Initializes Media Wallah tracking.
 * This is a rework of the obfuscated tracking code provided by Media Wallah.
 */
function initMediaWallah() {
	const mwOptions = {
		uid: '',
		custom: '',
		account_id: 1015,
		customer_id: 1012,
		tag_action: 'visit',
		timeout: 100, // in milliseconds
	};

	window.setBrowserAttributeData();
	let counter = 0;
	const init = function() {
		if ( window.mwDataReady() ) {
			document.body.appendChild( window.mwPixel( mwOptions ) );
		} else if ( counter === mwOptions.timeout ) {
			clearTimeout( init );
		} else {
			setTimeout( init, 1 );
			counter++;
		}
	};

	window.addEventListener
		? window.addEventListener( 'load', init, false )
		: window.attachEvent( 'onload', init );
}

/**
 * Initializes Quora tracking.
 * This is a rework of the obfuscated tracking code provided by Quora.
 */
function setupQuoraGlobal() {
	const quoraPixel = ( window.qp = function() {
		quoraPixel.qp
			? quoraPixel.qp.apply( quoraPixel, arguments )
			: quoraPixel.queue.push( arguments );
	} );
	quoraPixel.queue = [];
}

/**
 * This sets up the globals that the Facebook event library expects.
 * More info here: https://www.facebook.com/business/help/952192354843755
 */
function setUpFacebookGlobal() {
	const facebookEvents = ( window.fbq = function() {
		if ( facebookEvents.callMethod ) {
			facebookEvents.callMethod.apply( facebookEvents, arguments );
		} else {
			facebookEvents.queue.push( arguments );
		}
	} );

	if ( ! window._fbq ) {
		window._fbq = facebookEvents;
	}

	facebookEvents.push = facebookEvents;
	facebookEvents.loaded = true;
	facebookEvents.version = '2.0';
	facebookEvents.queue = [];
}

/**
 * This sets up the global `twq` function that Twitter expects.
 * More info here: https://github.com/Automattic/wp-calypso/pull/10235
 */
function setUpTwitterGlobal() {
	const twq = ( window.twq = function() {
		twq.exe ? twq.exe.apply( twq, arguments ) : twq.queue.push( arguments );
	} );
	twq.version = '1.1';
	twq.queue = [];
}

function setupOutbrainGlobal() {
	const api = ( window.obApi = function() {
		api.dispatch ? api.dispatch.apply( api, arguments ) : api.queue.push( arguments );
	} );
	api.version = '1.0';
	api.loaded = true;
	api.marketerId = TRACKING_IDS.outbrainAdvId;
	api.queue = [];
}

function loadTrackingScripts( callback ) {
	hasStartedFetchingScripts = true;

	const scripts = [];

	if ( isFacebookEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( FACEBOOK_TRACKING_SCRIPT_URL, onComplete );
		} );
	}

	if ( isAdwordsEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( GOOGLE_TRACKING_SCRIPT_URL, onComplete );
		} );
	}

	if ( isBingEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( BING_TRACKING_SCRIPT_URL, onComplete );
		} );
	}

	if ( isCriteoEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( CRITEO_TRACKING_SCRIPT_URL, onComplete );
		} );
	}

	if ( isQuantcastEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( quantcastAsynchronousTagURL(), onComplete );
		} );
	}

	if ( isYahooEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( YAHOO_TRACKING_SCRIPT_URL, onComplete );
		} );
	}

	if ( isTwitterEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( TWITTER_TRACKING_SCRIPT_URL, onComplete );
		} );
	}

	if ( isLinkedinEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( LINKED_IN_SCRIPT_URL, onComplete );
		} );
	}

	if ( isMediaWallahEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( MEDIA_WALLAH_SCRIPT_URL, onComplete );
		} );
	}

	if ( isQuoraEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( QUORA_SCRIPT_URL, onComplete );
		} );
	}

	if ( isYandexEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( YANDEX_SCRIPT_URL, onComplete );
		} );
	}

	if ( isOutbrainEnabled ) {
		scripts.push( function( onComplete ) {
			loadScript( OUTBRAIN_SCRIPT_URL, onComplete );
		} );
	}

	async.series( scripts, function( error ) {
		if ( error ) {
			debug( 'Some scripts failed to load: ', error );
		} else {
			// init Facebook
			if ( isFacebookEnabled ) {
				window.fbq( 'init', TRACKING_IDS.facebookInit );
			}

			// init Bing
			if ( isBingEnabled ) {
				const bingConfig = {
					ti: TRACKING_IDS.bingInit,
					q: window.uetq,
				};

				if ( typeof UET !== 'undefined' ) {
					// bing's script creates the UET global for us
					window.uetq = new UET( bingConfig ); // eslint-disable-line
					window.uetq.push( 'pageLoad' );
				}
			}

			// init Twitter
			if ( isTwitterEnabled ) {
				window.twq( 'init', TRACKING_IDS.twitterPixelId );
			}

			// init Media Wallah
			if ( isMediaWallahEnabled ) {
				initMediaWallah();
			}

			// init Quora
			if ( isQuoraEnabled ) {
				window.qp( 'init', TRACKING_IDS.quoraPixelId );
			}

			// init Yandex counter
			if ( isYandexEnabled ) {
				if ( window.Ya ) {
					window.yaCounter45268389 = new window.Ya.Metrika( { id: 45268389 } );
				} else {
					debug( "Error: Yandex's window.Ya not ready or missing" );
					isYandexEnabled = false;
				}
			}

			hasFinishedFetchingScripts = true;

			if ( typeof callback === 'function' ) {
				callback();
			}
			debug( 'Scripts loaded successfully' );
		}
	} );
}

/**
 * Returns whether ad tracking is allowed.
 *
 * This function returns false if:
 *
 * 1. 'ad-tracking' is disabled
 * 2. `Do Not Track` is enabled
 * 3. `document.location.href` may contain personally identifiable information
 *
 * @returns {Boolean} Is ad tracking is allowed?
 */
function isAdTrackingAllowed() {
	return config.isEnabled( 'ad-tracking' ) && ! shouldSkipAds();
}

/**
 * Fire tracking events for the purposes of retargeting on all Calypso pages
 *
 * @returns {void}
 */
function only_retarget() {
	if ( ! isAdTrackingAllowed() ) {
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( retarget );
	}

	// The reason we check whether the scripts have finished is to avoid a situation
	// where retarget is called once (which starts the load process) then immediately
	// again (in which case they've started to be fetched, but haven't finished).
	if ( ! hasFinishedFetchingScripts ) {
		return;
	}

	// Non rate limited retargeting
	debug( 'Retargeting: Quantcast' );

	// Quantcast
	if ( isQuantcastEnabled ) {
		window._qevents.push( {
			qacct: TRACKING_IDS.quantcast,
			event: 'refresh',
		} );
	}

	// Rate limited retargeting
	const nowTimestamp = Date.now() / 1000;
	if ( nowTimestamp < lastRetargetTime + retargetingPeriod ) {
		return;
	}
	lastRetargetTime = nowTimestamp;

	debug( 'Retargeting: others (rate limited)' );

	// Facebook
	if ( isFacebookEnabled ) {
		window.fbq( 'track', 'PageView' );
	}

	// Twitter
	if ( isTwitterEnabled ) {
		window.twq( 'track', 'PageView' );
	}

	// AdWords
	if ( isAdwordsEnabled ) {
		if ( window.google_trackConversion ) {
			window.google_trackConversion( {
				google_conversion_id: ADWORDS_CONVERSION_ID,
				google_remarketing_only: true,
			} );
		}
	}

	// One by AOL
	if ( isAolEnabled ) {
		new Image().src = ONE_BY_AOL_AUDIENCE_BUILDING_PIXEL_URL;
	}

	// Quora
	if ( isQuoraEnabled ) {
		window.qp( 'track', 'ViewContent' );
	}

	// Yandex
	if ( isYandexEnabled ) {
		window.yaCounter45268389.hit( document.location.href );
	}

	// Outbrain
	if ( isOutbrainEnabled ) {
		window.obApi( 'track', 'PAGE_VIEW' );
	}
}

/**
 * Fire custom facebook conversion tracking event.
 *
 * @param {String} name - The name of the custom event.
 * @param {Object} properties - The custom event attributes.
 * @returns {void}
 */
export function trackCustomFacebookConversionEvent( name, properties ) {
	window.fbw && window.fbq( 'trackCustom', name, properties );
}

/**
 * Fire custom adwords conversation tracking event.
 *
 * @param {Object} properties - The custom event attributes.
 * @returns {void}
 */
export function trackCustomAdWordsRemarketingEvent( properties ) {
	window.google_trackConversion &&
		window.google_trackConversion( {
			google_conversion_id: ADWORDS_CONVERSION_ID,
			google_custom_params: properties,
			google_remarketing_only: true,
		} );
}

/**
 * A generic function that we can export and call to track plans page views with our ad partners
 */
export function retargetViewPlans() {
	if ( ! isAdTrackingAllowed() ) {
		return;
	}

	if ( isCriteoEnabled ) {
		recordPlansViewInCriteo();
	}
}

/**
 * Records that an item was added to the cart
 *
 * @param {Object} cartItem - The item added to the cart
 * @returns {void}
 */
export function recordAddToCart( cartItem ) {
	if ( ! isAdTrackingAllowed() ) {
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( recordAddToCart.bind( null, cartItem ) );
	}

	debug( 'Recorded that this item was added to the cart', cartItem );

	if ( isFacebookEnabled ) {
		window.fbq( 'track', 'AddToCart', {
			product_slug: cartItem.product_slug,
			free_trial: Boolean( cartItem.free_trial ),
		} );
	}

	if ( isCriteoEnabled ) {
		recordInCriteo( 'viewItem', {
			item: cartItem.product_id,
		} );
	}
}

/**
 * Records that a user viewed the checkout page
 *
 * @param {Object} cart - cart as `CartValue` object
 */
export function recordViewCheckout( cart ) {
	if ( isCriteoEnabled ) {
		recordViewCheckoutInCriteo( cart );
	}
}

/**
 * Tracks a purchase conversion
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @returns {void}
 */
export function recordOrder( cart, orderId ) {
	if ( ! isAdTrackingAllowed() ) {
		return;
	}

	// load the ecommerce plugin
	window.ga( 'require', 'ecommerce' );

	// Purchase tracking happens in one of three ways:

	// 1. Fire one tracking event that includes details about the entire order

	recordOrderInAtlas( cart, orderId );
	recordOrderInCriteo( cart, orderId );
	recordOrderInFloodlight( cart, orderId );

	// This has to come before we add the items to the Google Analytics cart
	recordOrderInGoogleAnalytics( cart, orderId );

	// 2. Fire a tracking event for each product purchased

	cart.products.forEach( product => {
		recordProduct( product, orderId );
	} );

	// Ensure we submit the cart to Google Analytics
	window.ga( 'ecommerce:send' );

	// 3. Fire a single tracking event without any details about what was purchased

	// Experian / One 2 One Media
	if ( isExperianEnabled ) {
		new Image().src = EXPERIAN_CONVERSION_PIXEL_URL;
	}

	if ( isAolEnabled ) {
		new Image().src = ONE_BY_AOL_CONVERSION_PIXEL_URL;
	}

	if ( isPandoraEnabled ) {
		new Image().src = PANDORA_CONVERSION_PIXEL_URL;
	}

	if ( isQuoraEnabled ) {
		window.qp( 'track', 'Generic' );
	}
}

/**
 * Recorders an individual product purchase conversion
 *
 * @param {Object} product - the product
 * @param {Number} orderId - the order id
 * @returns {void}
 */
function recordProduct( product, orderId ) {
	if ( ! isAdTrackingAllowed() ) {
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( recordProduct.bind( null, product, orderId ) );
	}

	const isJetpackPlan = productsValues.isJetpackPlan( product );

	if ( isJetpackPlan ) {
		debug( 'Recording Jetpack purchase', product );
	} else {
		debug( 'Recording purchase', product );
	}

	const currentUser = user.get();
	const userId = currentUser ? currentUser.ID : 0;

	try {
		// Google Analytics
		window.ga( 'ecommerce:addItem', {
			id: orderId,
			name: product.product_slug,
			price: product.cost,
			currency: product.currency,
		} );

		// Google AdWords
		if ( isAdwordsEnabled ) {
			if ( window.google_trackConversion ) {
				window.google_trackConversion( {
					google_conversion_id: isJetpackPlan
						? ADWORDS_CONVERSION_ID_JETPACK
						: ADWORDS_CONVERSION_ID,
					google_conversion_label: isJetpackPlan
						? TRACKING_IDS.googleConversionLabelJetpack
						: TRACKING_IDS.googleConversionLabel,
					google_conversion_value: product.cost,
					google_conversion_currency: product.currency,
					google_custom_params: {
						product_slug: product.product_slug,
						user_id: userId,
						order_id: orderId,
					},
					google_remarketing_only: false,
				} );
			}
		}

		// Facebook
		if ( isFacebookEnabled ) {
			window.fbq( 'track', 'Purchase', {
				currency: product.currency,
				product_slug: product.product_slug,
				value: product.cost,
				user_id: userId,
				order_id: orderId,
			} );
		}

		// Twitter
		if ( isTwitterEnabled ) {
			window.twq( 'track', 'Purchase', {
				value: product.cost.toString(),
				currency: product.currency,
				content_name: product.product_name,
				content_type: 'product',
				content_ids: [ product.product_slug ],
				num_items: product.volume,
				order_id: orderId,
			} );
		}

		// Yandex Goal
		if ( isYandexEnabled ) {
			window.yaCounter45268389.reachGoal( 'ProductPurchase', {
				order_id: orderId,
				product_slug: product.product_slug,
				order_price: product.cost,
				currency: product.currency,
			} );
		}

		if ( isSupportedCurrency( product.currency ) ) {
			const costUSD = costToUSD( product.cost, product.currency );

			// Bing
			if ( isBingEnabled ) {
				const bingParams = {
					ec: 'purchase',
					gv: costUSD,
				};
				if ( isJetpackPlan ) {
					// `el` must be included only for jetpack plans
					bingParams.el = 'jetpack';
				}
				window.uetq.push( bingParams );
			}

			// Quantcast
			if ( isQuantcastEnabled ) {
				// Note that all properties have to be strings or they won't get tracked
				window._qevents.push( {
					qacct: TRACKING_IDS.quantcast,
					labels: '_fp.event.Purchase Confirmation,_fp.pcat.' + product.product_slug,
					orderid: orderId.toString(),
					revenue: costUSD.toString(),
					event: 'refresh',
				} );
			}

			// Yahoo
			if ( isYahooEnabled ) {
				// Like the Quantcast tracking above, the price has to be passed as a string
				// See: https://developer.yahoo.com/gemini/guide/dottags/installing-tags/
				/*global YAHOO*/
				YAHOO.ywa.I13N.fireBeacon( [
					{
						projectId: TRACKING_IDS.yahooProjectId,
						properties: {
							pixelId: TRACKING_IDS.yahooPixelId,
							qstrings: {
								et: 'custom',
								ec: 'wordpress.com',
								ea: 'purchase',
								el: product.product_slug,
								gv: costUSD.toString(),
							},
						},
					},
				] );
			}
		}
	} catch ( err ) {
		debug( 'Unable to save purchase tracking data', err );
	}
}

/**
 * For Atlas, we track the entire order, not separately for each product in the order
 *
 * @see https://app.atlassolutions.com/help/atlashelp/727514814019823/ (Atlas account required)
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 */
function recordOrderInAtlas( cart, orderId ) {
	if ( ! isAdTrackingAllowed() || ! isAtlasEnabled ) {
		return;
	}

	const currentUser = user.get();

	const params = {
		event: 'Purchase',
		products: cart.products.map( product => product.product_name ).join( ', ' ),
		product_slugs: cart.products.map( product => product.product_slug ).join( ', ' ),
		revenue: cart.total_cost,
		currency_code: cart.currency,
		user_id: currentUser ? currentUser.ID : 0,
		order_id: orderId,
	};

	const urlParams = Object.keys( params )
		.map( function( key ) {
			return encodeURIComponent( key ) + '=' + encodeURIComponent( params[ key ] );
		} )
		.join( '&' );

	const urlWithParams =
		ATLAS_TRACKING_SCRIPT_URL +
		';m=' +
		TRACKING_IDS.atlasUniveralTagId +
		';cache=' +
		Math.random() +
		'?' +
		urlParams;

	loadScript( urlWithParams );
}

/**
 * Records an order in DCM Floodlight
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @returns {void}
 */
function recordOrderInFloodlight( cart, orderId ) {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'recordOrderInFloodlight: Record purchase' );

	const params = {
		type: 'wpsal0',
		cat: 'wpsale',
		qty: 1,
		cost: cart.total_cost,
		u2: cart.products.map( product => product.product_name ).join( ', ' ),
		u3: cart.currency,
		ord: orderId,
	};

	recordParamsInFloodlight( params );
}

/**
 * Records the anonymous user id and wpcom user id in DCM Floodlight
 *
 * @returns {void}
 */
export function recordAliasInFloodlight() {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'recordAliasInFloodlight: Aliasing anonymous user id with WordPress.com user id' );

	const params = {
		type: 'wordp0',
		cat: 'alias0',
	};

	recordParamsInFloodlight( params );
}

/**
 * Record that a user started sign up in DCM Floodlight
 *
 * @returns {void}
 */
function recordSignupStartInFloodlight() {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'DCM Floodlight: Recording sign up start' );

	const params = {
		type: 'wordp0',
		cat: 'pre-p0',
	};

	recordParamsInFloodlight( params );
}

/**
 * Record that a user signed up in DCM Floodlight
 *
 * @returns {void}
 */
function recordSignupCompletionInFloodlight() {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'DCM Floodlight: Recording sign up completion' );

	const params = {
		type: 'wordp0',
		cat: 'signu0',
	};

	recordParamsInFloodlight( params );
}

/**
 * Track a page view in DCM Floodlight
 *
 * @param {String} urlPath - The URL path
 * @returns {void}
 */
export function recordPageViewInFloodlight( urlPath ) {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	const nowTimestamp = Date.now() / 1000;
	if ( nowTimestamp < lastFloodlightPageViewTime + retargetingPeriod ) {
		return;
	}
	lastFloodlightPageViewTime = nowTimestamp;

	const sessionId = floodlightSessionId();

	debug( 'Floodlight: Recording page view for session ' + sessionId );

	// Set or bump the cookie's expiration date to maintain the session
	document.cookie = cookie.serialize( DCM_FLOODLIGHT_SESSION_COOKIE_NAME, sessionId, {
		maxAge: DCM_FLOODLIGHT_SESSION_LENGTH_IN_SECONDS,
	} );

	recordParamsInFloodlight( {
		type: 'wordp0',
		cat: 'wpvisit',
		u6: urlPath,
		u7: sessionId,
		ord: sessionId,
	} );

	recordParamsInFloodlight( {
		type: 'wordp0',
		cat: 'wppv',
		u6: urlPath,
		u7: sessionId,
	} );
}

/**
 * Returns the DCM Floodlight session id, generating a new one if there's not already one
 *
 * @returns {String} The session id
 */
function floodlightSessionId() {
	const cookies = cookie.parse( document.cookie );

	const existingSessionId = cookies[ DCM_FLOODLIGHT_SESSION_COOKIE_NAME ];
	if ( existingSessionId ) {
		debug( 'Floodlight: Existing session: ' + existingSessionId );
		return existingSessionId;
	}

	// Generate a 32-byte random session id
	const newSessionId = uuid().replace( new RegExp( '-', 'g' ), '' );
	debug( 'Floodlight: New session: ' + newSessionId );
	return newSessionId;
}

/**
 * Returns an object with DCM Floodlight user params
 *
 * @returns {Object} With the WordPress.com user id and/or the logged out Tracks id
 */
function floodlightUserParams() {
	const params = {};

	const currentUser = user.get();
	if ( currentUser ) {
		params.u4 = currentUser.ID.toString();
	}

	const anonymousUserId = tracksAnonymousUserId();
	if ( anonymousUserId ) {
		params.u5 = anonymousUserId;
	}

	return params;
}

/**
 * Returns the anoymous id stored in the `tk_ai` cookie
 *
 * @returns {String} - The Tracks anonymous user id
 */
function tracksAnonymousUserId() {
	const cookies = cookie.parse( document.cookie );
	return cookies.tk_ai;
}

/**
 * Given an object of Floodlight params, this dynamically loads an iframe with the appropraite URL
 *
 * @param {Object} params - An object of Floodlight params
 * @returns {void}
 */
function recordParamsInFloodlight( params ) {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	// Add in the u4 and u5 params
	params = assign( params, floodlightUserParams() );

	// As well as the advertiser id
	params.src = TRACKING_IDS.dcmFloodlightAdvertiserId;

	// The ord is only set for purchases; the rest of the time it should be a random string
	if ( params.ord === undefined ) {
		// From the docs:
		// "For unique user tags, use a constant value."
		// TODO: Should we use a constant value if it's a unique user? How do we determine a unique user?
		params.ord = floodlightCacheBuster();

		// From the docs:
		// "Unique user tags also require a random number as the value of the num= parameter."
		params.num = floodlightCacheBuster();
	}

	debug( 'recordParamsInFloodlight:', params );

	// Note that we're not generating a URL with traditional query arguments
	// Instead, each parameter is separated by a semicolon
	const urlParams = Object.keys( params )
		.map( function( key ) {
			return encodeURIComponent( key ) + '=' + encodeURIComponent( params[ key ] );
		} )
		.join( ';' );

	// The implementation guidance includes the question mark at the end of the URL
	const urlWithParams = DCM_FLOODLIGHT_IFRAME_URL + ';' + urlParams + '?';

	// Unlike other advertising networks, DCM Floodlight requires we load an iframe
	const iframe = document.createElement( 'iframe' );
	iframe.setAttribute( 'src', urlWithParams );
	iframe.setAttribute( 'width', '1' );
	iframe.setAttribute( 'height', '1' );
	iframe.setAttribute( 'frameborder', '0' );
	iframe.setAttribute( 'style', 'display: none' );
	document.body.appendChild( iframe );
}

/**
 * Returns a random value to pass with as Flodlight's `ord` parameter
 *
 * @returns {Number} A large random number
 */
function floodlightCacheBuster() {
	return Math.random() * 10000000000000;
}

/**
 * Records an order in Criteo
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @returns {void}
 */
function recordOrderInCriteo( cart, orderId ) {
	if ( ! isAdTrackingAllowed() || ! isCriteoEnabled ) {
		return;
	}

	recordInCriteo( 'trackTransaction', {
		id: orderId,
		currency: cart.currency,
		item: cartToCriteoItems( cart ),
	} );
}

/**
 * Records that a user viewed the checkout page
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {void}
 */
function recordViewCheckoutInCriteo( cart ) {
	if ( ! isAdTrackingAllowed() || ! isCriteoEnabled ) {
		return;
	}

	// Note that unlike `recordOrderInCriteo` above, this doesn't include the order id
	recordInCriteo( 'viewBasket', {
		currency: cart.currency,
		item: cartToCriteoItems( cart ),
	} );
}

/**
 * Converts the products in a cart to the format Criteo expects for its `items` property
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Array} - An array of items to include in the Criteo tracking call
 */
function cartToCriteoItems( cart ) {
	return cart.products.map( product => {
		return {
			id: product.product_id,
			price: product.cost,
			quantity: product.volume,
		};
	} );
}

/**
 * Records in Criteo that the visitor viewed the plans page
 */
function recordPlansViewInCriteo() {
	if ( ! isAdTrackingAllowed() || ! isCriteoEnabled ) {
		return;
	}

	recordInCriteo( 'viewItem', {
		item: '1',
	} );
}

/**
 * Records an event in Criteo
 *
 * @param {String} eventName - The name of the 'event' property such as 'viewItem' or 'viewBasket'
 * @param {Object} eventProps - Additional details about the event such as `{ item: '1' }`
 *
 * @returns {void}
 */
function recordInCriteo( eventName, eventProps ) {
	if ( ! isAdTrackingAllowed() || ! isCriteoEnabled ) {
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( recordInCriteo.bind( null, eventName, eventProps ) );
	}

	const events = [];
	events.push( { event: 'setAccount', account: TRACKING_IDS.criteo } );
	events.push( { event: 'setSiteType', type: criteoSiteType() } );

	if ( user.get() ) {
		events.push( { event: 'setEmail', email: [ user.get().email ] } );
	}

	const conversionEvent = clone( eventProps );
	conversionEvent.event = eventName;
	events.push( conversionEvent );

	// The deep clone is necessary because the Criteo script modifies the objects in the
	// array which causes the console to display different data than is originally added
	debug( 'Track `' + eventName + '` event in Criteo', cloneDeep( events ) );

	window.criteo_q.push( ...events );
}

/**
 * Returns the site type value that Criteo expects
 *
 * @note This logic was provided by Criteo and should not be modified
 *
 * @returns {String} 't', 'm', or 'd' for tablet, mobile, or desktop
 */
function criteoSiteType() {
	if ( /iPad/.test( navigator.userAgent ) ) {
		return 't';
	}

	if ( /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test( navigator.userAgent ) ) {
		return 'm';
	}

	return 'd';
}

/**
 * Records an order in Google Analytics
 *
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @returns {void}
 */
function recordOrderInGoogleAnalytics( cart, orderId ) {
	if ( ! isAdTrackingAllowed() ) {
		return;
	}

	window.ga( 'ecommerce:addTransaction', {
		id: orderId,
		affiliation: 'WordPress.com',
		revenue: cart.total_cost,
		currency: cart.currency,
	} );
}

/**
 * Returns the URL for Quantcast's Purchase Confirmation Tag
 *
 * @see https://www.quantcast.com/help/guides/using-the-quantcast-asynchronous-tag/
 *
 * @returns {String} The URL
 */
function quantcastAsynchronousTagURL() {
	const protocolAndSubdomain =
		document.location.protocol === 'https:' ? 'https://secure' : 'http://edge';

	return protocolAndSubdomain + '.quantserve.com/quant.js';
}

/**
 * Converts a cost into USD
 *
 * @note Don't rely on this for precise conversions, it's meant to be an estimate for ad tracking purposes
 *
 * @param {Number} cost - The cost of the cart or product
 * @param {String} currency - The currency such as `USD`, `JPY`, etc
 * @returns {String} Or null if the currency is not supported
 */
function costToUSD( cost, currency ) {
	if ( ! isSupportedCurrency( currency ) ) {
		return null;
	}

	return ( cost / EXCHANGE_RATES[ currency ] ).toFixed( 3 );
}

/**
 * Returns whether a currency is supported
 *
 * @param {String} currency - `USD`, `JPY`, etc
 * @returns {Boolean} Whether there's an exchange rate for the currency
 */
function isSupportedCurrency( currency ) {
	return Object.keys( EXCHANGE_RATES ).indexOf( currency ) !== -1;
}

/**
 * Record that a user started sign up
 *
 * @returns {void}
 */
export function recordSignupStart() {
	recordSignupStartInFloodlight();
}

/**
 * Record that a user completed sign up
 *
 * @returns {void}
 */
export function recordSignupCompletion() {
	recordSignupCompletionInFloodlight();
}

export function retarget( context, next ) {
	const nextFunction = typeof next === 'function' ? next : noop;

	only_retarget();

	nextFunction();
}
