/** @format */

/**
 * External dependencies
 */
import cookie from 'cookie';
import debugFactory from 'debug';
import { assign, clone, cloneDeep } from 'lodash';
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import config from 'config';
import productsValues from 'lib/products-values';
import userModule from 'lib/user';
import { loadScript as loadScriptCallback } from 'lib/load-script';
import { isAdTrackingAllowed, hashPii, costToUSD } from 'lib/analytics/utils';
import { promisify } from '../../utils';
import request from 'superagent';

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
const isGeminiEnabled = true;
const isWpcomGoogleAdsGtagEnabled = true;
const isJetpackGoogleAdsGtagEnabled = true;
const isQuantcastEnabled = true;
const isTwitterEnabled = true;
const isExperianEnabled = true;
const isLinkedinEnabled = true;
const isOutbrainEnabled = true;
const isIconMediaEnabled = true;
const isYahooEnabled = false;
let isYandexEnabled = false;
const isCriteoEnabled = false;
const isPandoraEnabled = false;
const isQuoraEnabled = false;
const isMediaWallahEnabled = false;
const isNanigansEnabled = true;

// Retargeting events are fired once every `retargetingPeriod` seconds.
const retargetingPeriod = 60 * 60 * 24;

// Last time the retarget() function effectively fired (Unix time in seconds).
let lastRetargetTime = 0;

/**
 * Constants
 */
const FACEBOOK_TRACKING_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js',
	GOOGLE_TRACKING_SCRIPT_URL = 'https://www.googleadservices.com/pagead/conversion_async.js',
	GOOGLE_GTAG_SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js?id=',
	BING_TRACKING_SCRIPT_URL = 'https://bat.bing.com/bat.js',
	CRITEO_TRACKING_SCRIPT_URL = 'https://static.criteo.net/js/ld/ld.js',
	ADWORDS_CONVERSION_ID = config( 'google_adwords_conversion_id' ),
	ADWORDS_CONVERSION_ID_JETPACK = config( 'google_adwords_conversion_id_jetpack' ),
	ADWORDS_SIGNUP_CONVERSION_ID = config( 'google_adwords_signup_conversion_id' ),
	YAHOO_GEMINI_CONVERSION_PIXEL_URL =
		'https://sp.analytics.yahoo.com/spp.pl?a=10000&.yp=10014088&ec=wordpresspurchase',
	YAHOO_GEMINI_AUDIENCE_BUILDING_PIXEL_URL =
		'https://sp.analytics.yahoo.com/spp.pl?a=10000&.yp=10014088',
	PANDORA_CONVERSION_PIXEL_URL =
		'https://data.adxcel-ec2.com/pixel/' +
		'?ad_log=referer&action=purchase&pixid=7efc5994-458b-494f-94b3-31862eee9e26',
	EXPERIAN_CONVERSION_PIXEL_URL =
		'https://d.turn.com/r/dd/id/L21rdC84MTYvY2lkLzE3NDc0MzIzNDgvdC8yL2NhdC8zMjE4NzUwOQ',
	ICON_MEDIA_RETARGETING_PIXEL_URL =
		'https://tags.w55c.net/rs?id=cab35a3a79dc4173b8ce2c47adad2cea&t=marketing',
	ICON_MEDIA_SIGNUP_PIXEL_URL =
		'https://tags.w55c.net/rs?id=d239e9cb6d164f7299d2dbf7298f930a&t=marketing',
	ICON_MEDIA_ORDER_PIXEL_URL =
		'https://tags.w55c.net/rs?id=d299eef42f2d4135a96d0d40ace66f3a&t=checkout',
	YAHOO_TRACKING_SCRIPT_URL = 'https://s.yimg.com/wi/ytc.js',
	TWITTER_TRACKING_SCRIPT_URL = 'https://static.ads-twitter.com/uwt.js',
	DCM_FLOODLIGHT_IFRAME_URL = 'https://6355556.fls.doubleclick.net/activityi',
	LINKED_IN_SCRIPT_URL = 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
	MEDIA_WALLAH_SCRIPT_URL = 'https://d3ir0rz7vxwgq5.cloudfront.net/mwData.min.js',
	QUORA_SCRIPT_URL = 'https://a.quora.com/qevents.js',
	YANDEX_SCRIPT_URL = 'https://mc.yandex.ru/metrika/watch.js',
	OUTBRAIN_SCRIPT_URL = 'https://amplify.outbrain.com/cp/obtp.js',
	NANIGANS_SCRIPT_URL = 'https://cdn.nanigans.com/NaN_tracker.js',
	TRACKING_IDS = {
		bingInit: '4074038',
		facebookInit: '823166884443641',
		facebookJetpackInit: '919484458159593',
		googleConversionLabel: 'MznpCMGHr2MQ1uXz_AM',
		googleConversionLabelJetpack: '0fwbCL35xGIQqv3svgM',
		googleSignupConversionLabel: 'zKK-CKPG7ocBENbl8_wD',
		criteo: '31321',
		quantcast: 'p-3Ma3jHaQMB_bS',
		yahooProjectId: '10000',
		yahooPixelId: '10014088',
		twitterPixelId: 'nvzbs',
		dcmFloodlightAdvertiserId: '6355556',
		linkedInPartnerId: '195308',
		quoraPixelId: '420845cb70e444938cf0728887a74ca1',
		outbrainAdvId: '00f0f5287433c2851cc0cb917c7ff0465e',
		nanigansAppId: '653793',
		wpcomGoogleAdsGtag: 'AW-946162814',
		wpcomGoogleAdsGtagPurchase: 'AW-946162814/taG8CPW8spQBEP6YlcMD', // "WordPress.com Purchase Gtag" event
		wpcomGoogleAdsGtagSignup: 'AW-946162814/5-NnCKy3xZQBEP6YlcMD', // "All Calypso Signups (WordPress.com)" event
		jetpackGoogleAdsGtag: 'AW-937115306',
		jetpackGoogleAdsGtagPurchase: 'AW-937115306/87huCM-P7ZMBEKr97L4D', // "Jetpack Purchase Plan Gtag" event
	},
	// This name is something we created to store a session id for DCM Floodlight session tracking
	DCM_FLOODLIGHT_SESSION_COOKIE_NAME = 'dcmsid',
	DCM_FLOODLIGHT_SESSION_LENGTH_IN_SECONDS = 1800;

/**
 * Globals
 */

if ( typeof window !== 'undefined' ) {
	// Facebook
	if ( isFacebookEnabled ) {
		setupFacebookGlobal();
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

	// Google Ads Gtag for wordpress.com
	if ( isWpcomGoogleAdsGtagEnabled ) {
		setupWpcomGoogleAdsGtag();
	}

	// Google Ads Gtag for Jetpack
	if ( isJetpackGoogleAdsGtagEnabled ) {
		setupJetpackGoogleAdsGtag();
	}

	// Twitter
	if ( isTwitterEnabled ) {
		setupTwitterGlobal();
	}

	// Linkedin
	if ( isLinkedinEnabled && ! window._linkedin_data_partner_id ) {
		window._linkedin_data_partner_id = TRACKING_IDS.linkedInPartnerId;
	}

	// Quora
	if ( isQuoraEnabled ) {
		setupQuoraGlobal();
	}

	// Outbrain
	if ( isOutbrainEnabled ) {
		setupOutbrainGlobal();
	}
}

/**
 * Refreshes the GDPR `country_code` cookie every 6 hours (like A8C_Analytics wpcom plugin).
 *
 * @param {Function} callback - Callback functon to call once the `country_code` cooke has been succesfully refreshed.
 * @returns {Boolean} Returns `true` if the `country_code` cooke needs to be refreshed.
 */
function maybeRefreshCountryCodeCookieGdpr( callback ) {
	const cookieMaxAgeSeconds = 6 * 60 * 60;

	const cookies = cookie.parse( document.cookie );

	if ( ! cookies.country_code || 'unknown ' === cookies.country_code ) {
		// cache buster
		const v = new Date().getTime();
		request
			.get( 'https://public-api.wordpress.com/geo/?v=' + v )
			.then( res => {
				document.cookie = cookie.serialize( 'country_code', res.body.country_short, {
					path: '/',
					maxAge: cookieMaxAgeSeconds,
				} );
				callback();
			} )
			.catch( err => {
				document.cookie = cookie.serialize( 'country_code', 'unknown', {
					path: '/',
					maxAge: cookieMaxAgeSeconds,
				} );
				debug( 'refreshGeoIpCountryCookieGdpr Error: ', err );
			} );

		return true;
	}

	return false;
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
	if ( window.qp ) {
		return;
	}

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
function setupFacebookGlobal() {
	if ( window.fbq ) {
		return;
	}

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

	/*
	 * Disable automatic PageView pushState tracking. It causes problems when we're using multiple FB pixel IDs.
	 * The objective here is to avoid firing a PageView against multiple FB pixel IDs. By disabling pushState tracking,
	 * we can do PageView tracking for FB on our own. See: `retarget()` in this file.
	 *
	 * There's more about the `disablePushState` flag here:
	 * <https://developers.facebook.com/ads/blog/post/2017/05/29/tagging-a-single-page-application-facebook-pixel/>
	 */
	window._fbq.disablePushState = true;

	facebookEvents.push = facebookEvents;
	facebookEvents.loaded = true;
	facebookEvents.version = '2.0';
	facebookEvents.queue = [];
}

/**
 * This sets up the global `twq` function that Twitter expects.
 * More info here: https://github.com/Automattic/wp-calypso/pull/10235
 */
function setupTwitterGlobal() {
	if ( window.twq ) {
		return;
	}

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

/**
 * For Nanigans, we delay the configuration until an actual purchase is made.
 *
 * Becomes true when the global configuration has been added to the window.NaN_api
 *
 * @type {boolean}
 */
let isNanigansConfigured = false;

/**
 * Defines the global variables required by Nanigans
 * (app tracking ID, user's hashed e-mail)
 */
function setupNanigansGlobal() {
	isNanigansConfigured = true;

	const currentUser = user.get();
	const normalizedEmail =
		currentUser && currentUser.email ? currentUser.email.toLowerCase().replace( /\s/g, '' ) : '';

	window.NaN_api = [
		[ TRACKING_IDS.nanigansAppId, normalizedEmail ? hashPii( normalizedEmail ) : '' ],
	];

	debug( 'Nanigans setup: ', window.NaN_api, ', for e-mail: ' + normalizedEmail );
}

const loadScript = promisify( loadScriptCallback );

async function loadTrackingScripts( callback ) {
	hasStartedFetchingScripts = true;

	const scripts = [];

	if ( isFacebookEnabled ) {
		scripts.push( FACEBOOK_TRACKING_SCRIPT_URL );
	}

	if ( isAdwordsEnabled ) {
		scripts.push( GOOGLE_TRACKING_SCRIPT_URL );
	}

	// The Gtag script needs to be loaded with an ID in the URL so we search for the first available one.
	const enabledGtags = [
		isWpcomGoogleAdsGtagEnabled && TRACKING_IDS.wpcomGoogleAdsGtag,
		isJetpackGoogleAdsGtagEnabled && TRACKING_IDS.jetpackGoogleAdsGtag,
	].filter( id => false !== id );
	if ( enabledGtags.length > 0 ) {
		scripts.push( GOOGLE_GTAG_SCRIPT_URL + enabledGtags[ 0 ] );
	}

	if ( isBingEnabled ) {
		scripts.push( BING_TRACKING_SCRIPT_URL );
	}

	if ( isCriteoEnabled ) {
		scripts.push( CRITEO_TRACKING_SCRIPT_URL );
	}

	if ( isQuantcastEnabled ) {
		scripts.push( quantcastAsynchronousTagURL() );
	}

	if ( isYahooEnabled ) {
		scripts.push( YAHOO_TRACKING_SCRIPT_URL );
	}

	if ( isTwitterEnabled ) {
		scripts.push( TWITTER_TRACKING_SCRIPT_URL );
	}

	if ( isLinkedinEnabled ) {
		scripts.push( LINKED_IN_SCRIPT_URL );
	}

	if ( isMediaWallahEnabled ) {
		scripts.push( MEDIA_WALLAH_SCRIPT_URL );
	}

	if ( isQuoraEnabled ) {
		scripts.push( QUORA_SCRIPT_URL );
	}

	if ( isYandexEnabled ) {
		scripts.push( YANDEX_SCRIPT_URL );
	}

	if ( isOutbrainEnabled ) {
		scripts.push( OUTBRAIN_SCRIPT_URL );
	}

	let hasError = false;
	for ( const src of scripts ) {
		try {
			await loadScript( src );
		} catch ( error ) {
			hasError = true;
			debug( 'A tracking script failed to load: ', error );
		}
	}

	if ( hasError ) {
		return;
	}

	// init Facebook
	if ( isFacebookEnabled ) {
		initFacebook();
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

	// uses JSON.stringify for consistency with recordOrder()
	debug( 'loadTrackingScripts: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
}

/**
 * Fire tracking events for the purposes of retargeting on all Calypso pages
 *
 * @param {string} urlPath The URL path we should report to the ad-trackers which may be different from the actual one
 * for privacy reasons.
 *
 * @returns {void}
 */
export function retarget( urlPath ) {
	if ( maybeRefreshCountryCodeCookieGdpr( retarget.bind( null, urlPath ) ) ) {
		return;
	}

	if ( ! isAdTrackingAllowed() ) {
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( retarget.bind( null, urlPath ) );
	}

	// The reason we check whether the scripts have finished is to avoid a situation
	// where retarget is called once (which starts the load process) then immediately
	// again (in which case they've started to be fetched, but haven't finished).
	if ( ! hasFinishedFetchingScripts ) {
		return;
	}

	// Non rate limited retargeting

	// Quantcast
	if ( isQuantcastEnabled ) {
		window._qevents.push( {
			qacct: TRACKING_IDS.quantcast,
			event: 'refresh',
		} );
		debug( 'Retargeting: Quantcast' );
	}

	// Facebook
	if ( isFacebookEnabled ) {
		window.fbq( 'trackSingle', TRACKING_IDS.facebookInit, 'PageView' );
		debug( 'Retargeting: Facebook' );
	}

	// Rate limited retargeting

	const nowTimestamp = Date.now() / 1000;
	if ( nowTimestamp < lastRetargetTime + retargetingPeriod ) {
		return;
	}
	lastRetargetTime = nowTimestamp;

	// Twitter
	if ( isTwitterEnabled ) {
		window.twq( 'track', 'PageView' );
		debug( 'Retargeting: [rate limited] Twitter' );
	}

	// AdWords
	if ( isAdwordsEnabled ) {
		if ( window.google_trackConversion ) {
			window.google_trackConversion( {
				google_conversion_id: ADWORDS_CONVERSION_ID,
				google_remarketing_only: true,
			} );
		}
		debug( 'Retargeting: [rate limited] AdWords' );
	}

	// Floodlight
	recordPageViewInFloodlight( urlPath );

	// Yahoo Gemini
	if ( isGeminiEnabled ) {
		new Image().src = YAHOO_GEMINI_AUDIENCE_BUILDING_PIXEL_URL;
		debug( 'Retargeting: [rate limited] Yahoo' );
	}

	// Quora
	if ( isQuoraEnabled ) {
		window.qp( 'track', 'ViewContent' );
		debug( 'Retargeting: [rate limited] Quora' );
	}

	// Yandex
	if ( isYandexEnabled ) {
		window.yaCounter45268389.hit( urlPath );
		debug( 'Retargeting: [rate limited] Yandex' );
	}

	// Outbrain
	if ( isOutbrainEnabled ) {
		window.obApi( 'track', 'PAGE_VIEW' );
		debug( 'Retargeting: [rate limited] Outbrain' );
	}

	// Icon Media
	if ( isIconMediaEnabled ) {
		new Image().src = ICON_MEDIA_RETARGETING_PIXEL_URL;
		debug( 'Retargeting: [rate limited] Icon Media' );
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
	window.fbq && window.fbq( 'trackSingleCustom', TRACKING_IDS.facebookInit, name, properties );
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

function splitWpcomJetpackCartInfo( cart ) {
	// Note: reduce() requires a non 0-length array.
	const jetpackCost =
		0 === cart.products.length
			? 0
			: cart.products
					.map( product => ( productsValues.isJetpackPlan( product ) ? product.cost : 0 ) )
					.reduce( ( accumulator, cost ) => accumulator + cost );
	const wpcomCost = cart.total_cost - jetpackCost;
	const wpcomProducts = cart.products.filter(
		product => ! productsValues.isJetpackPlan( product )
	);
	const jetpackProducts = cart.products.filter( product =>
		productsValues.isJetpackPlan( product )
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
	};
}

export function recordRegistration() {
	// TODO:

	debug( 'recordRegistration: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
}

/**
 * Tracks a signup conversion by generating a
 * synthetic cart and then treating it like an order.
 *
 * @param {String} slug - Signup slug.
 * @returns {void}
 */
export function recordSignup( slug ) {
	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordSignup: skipping as ad tracking is disallowed' );
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( recordSignup.bind( null, slug ) );
	}

	// Synthesize a cart object for signup tracking.
	const syntheticCart = {
		is_signup: true,
		currency: 'USD',
		total_cost: 0,
		products: [
			{
				is_signup: true,
				product_id: slug,
				product_slug: slug,
				product_name: slug,
				currency: 'USD',
				volume: 1,
				cost: 0,
			},
		],
	};

	// 35-byte signup tracking ID.
	const syntheticOrderId = 's_' + uuid().replace( /-/g, '' );

	const currentUser = user.get();
	const userId = currentUser ? hashPii( currentUser.ID ) : 0;

	const usdCost = costToUSD( syntheticCart.total_cost, syntheticCart.currency );

	// AdWords

	if ( isAdwordsEnabled ) {
		if ( window.google_trackConversion ) {
			window.google_trackConversion( {
				google_conversion_id: ADWORDS_SIGNUP_CONVERSION_ID,
				google_conversion_label: TRACKING_IDS.googleSignupConversionLabel,
				google_conversion_value: syntheticCart.total_cost,
				google_conversion_currency: syntheticCart.currency,
				google_custom_params: {
					product_slug: slug,
					user_id: userId,
					order_id: syntheticOrderId,
				},
				google_remarketing_only: false,
			} );
		}
	}

	// Google Ads Gtag

	if ( isWpcomGoogleAdsGtagEnabled ) {
		const eventData = {
			send_to: TRACKING_IDS.wpcomGoogleAdsGtagSignup,
			value: syntheticCart.total_cost,
			currency: syntheticCart.currency,
			transaction_id: syntheticOrderId,
		};
		window.gtag( 'event', 'conversion', eventData );
		debug( 'recordSignup: [Google Ads Gtag] record WPCom signup', eventData );
	}

	// Bing

	if ( isBingEnabled ) {
		if ( null !== usdCost ) {
			const bingParams = {
				ec: 'signup',
				gv: usdCost,
			};
			window.uetq.push( bingParams );
			debug( 'recordSignup: [Bing] record WPCom signup', bingParams );
		} else {
			debug( 'recordSignup: [Bing] currency not supported, dropping WPCom pixel' );
		}
	}

	// Facebook

	if ( isFacebookEnabled ) {
		const fbParams = {
			product_slug: syntheticCart.products.map( product => product.product_slug ).join( ', ' ),
			value: syntheticCart.total_cost,
			currency: syntheticCart.currency,
			user_id: userId,
			order_id: syntheticOrderId,
		};

		window.fbq( 'trackSingle', TRACKING_IDS.facebookInit, 'Subscribe', fbParams );
		debug( 'recordSignup: [Facebook] record WPCom signup', fbParams );
	}

	// DCM Floodlight

	if ( isFloodlightEnabled ) {
		const params = {
			type: 'wordp0',
			cat: 'signu1',
			ord: 1, // "Counting method" = "Unique" requires "ord" to be 1
		};
		recordParamsInFloodlight( params );
		debug( 'recordSignup: [Floodlight] record signup' );
	}

	// Icon Media

	if ( isIconMediaEnabled ) {
		new Image().src = ICON_MEDIA_SIGNUP_PIXEL_URL;
	}

	debug( 'recordSignup: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
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

	const isJetpackPlan = productsValues.isJetpackPlan( cartItem );

	if ( isJetpackPlan ) {
		debug( 'recordAddToCart: [Jetpack]', cartItem );
	} else {
		debug( 'recordAddToCart: [WPCom]', cartItem );
	}

	if ( isFacebookEnabled ) {
		window.fbq(
			'trackSingle',
			isJetpackPlan ? TRACKING_IDS.facebookJetpackInit : TRACKING_IDS.facebookInit,
			'AddToCart',
			{
				product_slug: cartItem.product_slug,
				free_trial: Boolean( cartItem.free_trial ),
			}
		);
	}

	if ( isCriteoEnabled ) {
		recordInCriteo( 'viewItem', {
			item: cartItem.product_id,
		} );
	}

	debug( 'recordAddToCart: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
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
		debug( 'recordOrder: [Skipping] ad tracking is not allowed' );
		return;
	}

	if ( cart.is_signup ) {
		return;
	}

	if ( cart.total_cost < 0.01 ) {
		debug( 'recordOrder: [Skipping] total cart cost is less than 0.01' );
		return;
	}

	const usdTotalCost = costToUSD( cart.total_cost, cart.currency );

	// load the ecommerce plugin
	debug( 'recordOrder: ga ecommerce plugin load' );
	window.ga( 'require', 'ecommerce' );

	// Purchase tracking happens in one of three ways:

	// 1. Fire one tracking event that includes details about the entire order

	const wpcomJetpackCartInfo = splitWpcomJetpackCartInfo( cart );
	debug( 'recordOrder: wpcomJetpackCartInfo:', wpcomJetpackCartInfo );

	recordOrderInGoogleAds( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInFacebook( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInFloodlight( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInBing( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInQuantcast( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInNanigans( cart, orderId );
	recordOrderInCriteo( cart, orderId );

	// This has to come before we add the items to the Google Analytics cart
	recordOrderInGoogleAnalytics( cart, orderId );

	// 2. Fire a tracking event for each product purchased

	cart.products.forEach( product => {
		recordProduct( product, orderId );
	} );

	// Ensure we submit the cart to Google Analytics
	debug( 'recordOrder: ga ecommerce send' );
	window.ga( 'ecommerce:send' );

	// 3. Fire a single tracking event without any details about what was purchased

	// Experian / One 2 One Media
	if ( isExperianEnabled ) {
		new Image().src = EXPERIAN_CONVERSION_PIXEL_URL;
	}

	// Yahoo Gemini
	if ( isGeminiEnabled ) {
		new Image().src =
			YAHOO_GEMINI_CONVERSION_PIXEL_URL + ( usdTotalCost !== null ? '&gv=' + usdTotalCost : '' );
	}

	if ( isPandoraEnabled ) {
		new Image().src = PANDORA_CONVERSION_PIXEL_URL;
	}

	if ( isQuoraEnabled ) {
		window.qp( 'track', 'Generic' );
	}

	if ( isIconMediaEnabled ) {
		const skus = cart.products.map( product => product.product_slug ).join( ',' );
		new Image().src =
			ICON_MEDIA_ORDER_PIXEL_URL + `&tx=${ orderId }&sku=${ skus }&price=${ usdTotalCost }`;
	}

	// Uses JSON.stringify() to print the expanded object because during localhost or .live testing after firing this
	// event we redirect the user to wordpress.com which causes a domain change preventing the expanding and inspection
	// of any object in the JS console since they are no longer available.
	debug( 'recordOrder: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
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
	const userId = currentUser ? hashPii( currentUser.ID ) : 0;

	try {
		// Google Analytics
		const item = {
			currency: product.currency,
			id: orderId,
			name: product.product_slug,
			price: product.cost,
			sku: product.product_slug,
			quantity: 1,
		};
		debug( 'recordProduct: ga ecommerce add item', item );
		window.ga( 'ecommerce:addItem', item );

		// Google AdWords
		if ( isAdwordsEnabled ) {
			if ( window.google_trackConversion ) {
				let googleConversionId, googleConversionLabel;

				if ( isJetpackPlan ) {
					googleConversionId = ADWORDS_CONVERSION_ID_JETPACK;
					googleConversionLabel = TRACKING_IDS.googleConversionLabelJetpack;
				} else {
					googleConversionId = ADWORDS_CONVERSION_ID;
					googleConversionLabel = TRACKING_IDS.googleConversionLabel;
				}

				window.google_trackConversion( {
					google_conversion_id: googleConversionId,
					google_conversion_label: googleConversionLabel,
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

		const costUSD = costToUSD( product.cost, product.currency );
		if ( null !== costUSD ) {
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
 * Records an order in Quantcast
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @param {Object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
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
					wpcomJetpackCartInfo.wpcomProducts.map( product => product.product_slug ).join( ' ' ),
				orderid: orderId.toString(),
				revenue: wpcomJetpackCartInfo.wpcomCostUSD.toString(),
				event: 'refresh',
			};
			window._qevents.push( params );
			debug( 'recordOrderInQuantcast: record WPCom purchase', params );
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
					wpcomJetpackCartInfo.jetpackProducts.map( product => product.product_slug ).join( ' ' ),
				orderid: orderId.toString(),
				revenue: wpcomJetpackCartInfo.jetpackCostUSD.toString(),
				event: 'refresh',
			};
			window._qevents.push( params );
			debug( 'recordOrderInQuantcast: record Jetpack purchase', params );
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
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @param {Object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInFloodlight( cart, orderId, wpcomJetpackCartInfo ) {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'recordOrderInFloodlight: record purchase' );

	// Legacy "Purchase Confirmation" event
	let params = {
		type: 'wpsal0',
		cat: 'wpsale',
		qty: 1,
		cost: cart.total_cost,
		u2: cart.products.map( product => product.product_name ).join( ', ' ),
		u3: cart.currency,
		ord: orderId,
	};
	recordParamsInFloodlight( params );

	// WPCom
	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		params = {
			type: 'wpsal0',
			cat: 'purch0',
			qty: 1,
			cost: wpcomJetpackCartInfo.wpcomCost,
			u2: wpcomJetpackCartInfo.wpcomProducts.map( product => product.product_name ).join( ', ' ),
			u3: cart.currency,
			ord: orderId,
		};
		recordParamsInFloodlight( params );
	}

	// Jetpack
	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		params = {
			type: 'wpsal0',
			cat: 'purch00',
			qty: 1,
			cost: wpcomJetpackCartInfo.jetpackCost,
			u2: wpcomJetpackCartInfo.jetpackProducts.map( product => product.product_name ).join( ', ' ),
			u3: cart.currency,
			ord: orderId,
		};
		recordParamsInFloodlight( params );
	}
}

/**
 * Records an order in Nanigans. If nanigans is not already loaded and configured, it configures it now (delayed load
 * until the moment when we actually need this pixel).
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @returns {void}
 */
function recordOrderInNanigans( cart, orderId ) {
	if ( ! isAdTrackingAllowed() || ! isNanigansEnabled ) {
		return;
	}

	const paidProducts = cart.products.filter( product => product.cost >= 0.01 );

	if ( paidProducts.length === 0 ) {
		debug( 'recordOrderInNanigans: Skip cart because it has ONLY <0.01 products' );
		return;
	}

	debug( 'recordOrderInNanigans: Record purchase' );

	const productPrices = paidProducts.map( product => product.cost * 100 ); // VALUE is in cents, [ 0, 9600 ]
	const eventDetails = {
		sku: paidProducts.map( product => product.product_slug ), // [ 'blog_domain', 'plan_premium' ]
		qty: paidProducts.map( () => 1 ), // [ 1, 1 ]
		currency: cart.currency,
		unique: orderId, // unique transaction id
	};

	const eventStruct = [
		'purchase', // EVENT_TYPE
		'main', // EVENT_NAME
		productPrices,
		eventDetails,
	];

	if ( ! isNanigansConfigured ) {
		setupNanigansGlobal();
		loadScript( NANIGANS_SCRIPT_URL );
	}

	debug( 'Nanigans push:', eventStruct );
	window.NaN_api.push( eventStruct ); // NaN api is either an array that supports push, either the real Nanigans API
}

/**
 * Records an order in Facebook (a single event for the entire order)
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @param {Object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInFacebook( cart, orderId, wpcomJetpackCartInfo ) {
	if ( ! isAdTrackingAllowed() || ! isFacebookEnabled ) {
		return;
	}

	/**
	 * We have made a conscious decision to ignore the 0 cost carts, such that these carts are not considered
	 * a conversion. We will analyze the results and make a final decision on this.
	 */
	if ( cart.total_cost < 0.01 ) {
		debug( 'recordOrderInFacebook: skipping due to a 0-value cart.' );
		return;
	}

	const currentUser = user.get();
	const userId = currentUser ? hashPii( currentUser.ID ) : 0;

	// WPCom

	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		const fbParams = {
			product_slug: wpcomJetpackCartInfo.wpcomProducts
				.map( product => product.product_slug )
				.join( ', ' ),
			value: wpcomJetpackCartInfo.wpcomCost,
			currency: cart.currency,
			user_id: userId,
			order_id: orderId,
		};

		window.fbq( 'trackSingle', TRACKING_IDS.facebookInit, 'Purchase', fbParams );
		debug( 'recordOrderInFacebook: record WPCom purchase', fbParams );
	}

	// Jetpack

	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		const fbParams = {
			product_slug: wpcomJetpackCartInfo.jetpackProducts
				.map( product => product.product_slug )
				.join( ', ' ),
			value: wpcomJetpackCartInfo.jetpackCost,
			currency: cart.currency,
			user_id: userId,
			order_id: orderId,
		};

		window.fbq( 'trackSingle', TRACKING_IDS.facebookJetpackInit, 'Purchase', fbParams );

		debug( 'recordOrderInFacebook: record Jetpack purchase', fbParams );
	}
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
 * Records a signup|purchase in Bing.
 *
 * @param {Object} cart - cart as `CartValue` object.
 * @param {Number} orderId - the order ID.
 * @param {Object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInBing( cart, orderId, wpcomJetpackCartInfo ) {
	// NOTE: `orderId` is not used at this time, but it could be useful in the near future.

	if ( ! isAdTrackingAllowed() || ! isBingEnabled ) {
		return;
	}

	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		if ( null !== wpcomJetpackCartInfo.wpcomCostUSD ) {
			const bingParams = {
				ec: 'purchase',
				gv: wpcomJetpackCartInfo.wpcomCostUSD,
			};
			window.uetq.push( bingParams );
			debug( 'recordOrderInBing: record WPCom purchase', bingParams );
		} else {
			debug( `recordOrderInBing: currency ${ cart.currency } not supported, dropping WPCom pixel` );
		}
	}

	if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
		if ( null !== wpcomJetpackCartInfo.jetpackCostUSD ) {
			const bingParams = {
				ec: 'purchase',
				gv: wpcomJetpackCartInfo.jetpackCostUSD,
				// NOTE: `el` must be included only for jetpack plans.
				el: 'jetpack',
			};
			window.uetq.push( bingParams );
			debug( 'recordOrderInBing: record Jetpack purchase', bingParams );
		} else {
			debug(
				`recordOrderInBing: currency ${ cart.currency } not supported, dropping Jetpack pixel`
			);
		}
	}
}

/**
 * Record that a user started sign up in DCM Floodlight
 *
 * @returns {void}
 */
export function recordSignupStartInFloodlight() {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'DCM Floodlight: Recording sign up start' );

	const params = {
		type: 'wordp0',
		cat: 'pre-p0',
		ord: 1, // "Counting method" = "Unique" requires "ord" to be 1
	};

	recordParamsInFloodlight( params );
}

/**
 * Record that a user signed up in DCM Floodlight
 *
 * @returns {void}
 */
export function recordSignupCompletionInFloodlight() {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'DCM Floodlight: Recording sign up completion' );

	const params = {
		type: 'wordp0',
		cat: 'signu0',
		ord: 1, // "Counting method" = "Unique" requires "ord" to be 1
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

	const sessionId = floodlightSessionId();

	debug( 'Floodlight: [rate limited] recording page view for session ' + sessionId );

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
		params.u4 = hashPii( currentUser.ID );
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

	if ( cart.is_signup ) {
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
		events.push( { event: 'setEmail', email: [ hashPii( user.get().email ) ] } );
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
		debug( 'recordOrderInGoogleAnalytics: skipping as ad tracking is disallowed' );
		return;
	}

	const transaction = {
		id: orderId,
		affiliation: 'WordPress.com',
		revenue: cart.total_cost,
		currency: cart.currency,
	};
	debug( 'recordOrderInGoogleAnalytics: ga ecommerce add transaction', transaction );
	window.ga( 'ecommerce:addTransaction', transaction );
}

/**
 * Records an order/sign_up in Google Ads Gtag
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @param {Object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInGoogleAds( cart, orderId, wpcomJetpackCartInfo ) {
	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordOrderInGoogleAds: skipping as ad tracking is disallowed' );
		return;
	}

	if ( isJetpackGoogleAdsGtagEnabled ) {
		if ( wpcomJetpackCartInfo.containsJetpackProducts ) {
			const eventData = {
				send_to: TRACKING_IDS.jetpackGoogleAdsGtagPurchase,
				value: wpcomJetpackCartInfo.jetpackCost,
				currency: cart.currency,
				transaction_id: orderId,
			};
			window.gtag( 'event', 'conversion', eventData );
			debug( 'recordOrderInGoogleAds: Record Jetpack Purchase', eventData );
		}
	}

	if ( isWpcomGoogleAdsGtagEnabled ) {
		if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
			const eventData = {
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagPurchase,
				value: wpcomJetpackCartInfo.wpcomCost,
				currency: cart.currency,
				transaction_id: orderId,
			};
			window.gtag( 'event', 'conversion', eventData );
			debug( 'recordOrderInGoogleAds: Record WPCom Purchase', eventData );
		}
	}
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

function setupGtag() {
	if ( window.dataLayer && window.gtag ) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.gtag = function() {
		window.dataLayer.push( arguments );
	};
	window.gtag( 'js', new Date() );
}

function setupJetpackGoogleAdsGtag() {
	setupGtag();
	window.gtag( 'config', TRACKING_IDS.jetpackGoogleAdsGtag );
}

function setupWpcomGoogleAdsGtag() {
	setupGtag();
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAdsGtag );
}

/**
 * Initializes the Facebook pixel.
 *
 * When the user is logged in, additional hashed data is being forwarded.
 */
function initFacebook() {
	if ( user.get() ) {
		initFacebookAdvancedMatching();
	} else {
		window.fbq( 'init', TRACKING_IDS.facebookInit );

		/*
		 * Also initialize the FB pixel for Jetpack.
		 * However, disable auto-config for this secondary pixel ID.
		 * See: <https://developers.facebook.com/docs/facebook-pixel/api-reference#automatic-configuration>
		 */
		window.fbq( 'set', 'autoConfig', false, TRACKING_IDS.facebookJetpackInit );
		window.fbq( 'init', TRACKING_IDS.facebookJetpackInit );
	}
}

/**
 * See https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
 */
function initFacebookAdvancedMatching() {
	// All data must be in lowercase. Remove all spaces.
	const fbRequirementsFormatter = function( str ) {
		return str.toLowerCase().replace( / /g, '' );
	};

	const currentUser = user.get();
	const advancedMatching = {
		em: fbRequirementsFormatter( currentUser.email ),
	};

	debug( 'FB Advanced Matching', advancedMatching );

	window.fbq( 'init', TRACKING_IDS.facebookInit, advancedMatching );

	/*
	 * Also initialize the FB pixel for Jetpack.
	 * However, disable auto-config for this secondary pixel ID.
	 * See: <https://developers.facebook.com/docs/facebook-pixel/api-reference#automatic-configuration>
	 */
	window.fbq( 'set', 'autoConfig', false, TRACKING_IDS.facebookJetpackInit );
	window.fbq( 'init', TRACKING_IDS.facebookJetpackInit, advancedMatching );
}
