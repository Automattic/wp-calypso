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
import { loadScript as loadScriptCallback } from '@automattic/load-script';
import {
	isAdTrackingAllowed,
	hashPii,
	costToUSD,
	getNormalizedHashedUserEmail,
} from 'lib/analytics/utils';
import { promisify } from '../../utils';
import { doNotTrack, isPiiUrl, mayWeTrackCurrentUserGdpr } from './utils';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:ad-tracking' );
const user = userModule();

// Enable/disable ad-tracking
// These should not be put in the json config as they must not differ across environments
const isGoogleAnalyticsEnabled = true;
const isFloodlightEnabled = true;
const isFacebookEnabled = true;
const isBingEnabled = true;
const isGeminiEnabled = true;
const isWpcomGoogleAdsGtagEnabled = true;
const isQuantcastEnabled = true;
const isExperianEnabled = true;
const isOutbrainEnabled = true;
const isIconMediaEnabled = true;
const isPinterestEnabled = true;
const isTwitterEnabled = false;
const isLinkedinEnabled = false;
const isCriteoEnabled = false;
const isPandoraEnabled = false;
const isQuoraEnabled = false;

// Retargeting events are fired once every `retargetingPeriod` seconds.
const retargetingPeriod = 60 * 60 * 24;

// Last time the retarget() function effectively fired (Unix time in seconds).
let lastRetargetTime = 0;

/**
 * Constants
 */
const FACEBOOK_TRACKING_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js',
	GOOGLE_GTAG_SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js?id=',
	BING_TRACKING_SCRIPT_URL = 'https://bat.bing.com/bat.js',
	CRITEO_TRACKING_SCRIPT_URL = 'https://static.criteo.net/js/ld/ld.js',
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
	TWITTER_TRACKING_SCRIPT_URL = 'https://static.ads-twitter.com/uwt.js',
	LINKED_IN_SCRIPT_URL = 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
	QUORA_SCRIPT_URL = 'https://a.quora.com/qevents.js',
	OUTBRAIN_SCRIPT_URL = 'https://amplify.outbrain.com/cp/obtp.js',
	PINTEREST_SCRIPT_URL = 'https://s.pinimg.com/ct/core.js',
	TRACKING_IDS = {
		bingInit: '4074038',
		facebookInit: '823166884443641',
		facebookJetpackInit: '919484458159593',
		criteo: '31321',
		quantcast: 'p-3Ma3jHaQMB_bS',
		twitterPixelId: 'nvzbs',
		dcmFloodlightAdvertiserId: '6355556',
		linkedInPartnerId: '195308',
		quoraPixelId: '420845cb70e444938cf0728887a74ca1',
		outbrainAdvId: '00f0f5287433c2851cc0cb917c7ff0465e',
		wpcomGoogleAnalyticsGtag: config( 'google_analytics_key' ),
		wpcomFloodlightGtag: 'DC-6355556',
		wpcomGoogleAdsGtag: 'AW-946162814',
		wpcomGoogleAdsGtagRegistration: 'AW-946162814/_6cKCK6miZYBEP6YlcMD', // "WordPress.com Registration"
		wpcomGoogleAdsGtagSignup: 'AW-946162814/5-NnCKy3xZQBEP6YlcMD', // "All Calypso Signups (WordPress.com)"
		wpcomGoogleAdsGtagAddToCart: 'AW-946162814/MF4yCNi_kZYBEP6YlcMD', // "WordPress.com AddToCart"
		wpcomGoogleAdsGtagPurchase: 'AW-946162814/taG8CPW8spQBEP6YlcMD', // "WordPress.com Purchase Gtag"
		pinterestInit: '2613194105266',
	},
	// This name is something we created to store a session id for DCM Floodlight session tracking
	DCM_FLOODLIGHT_SESSION_COOKIE_NAME = 'dcmsid',
	DCM_FLOODLIGHT_SESSION_LENGTH_IN_SECONDS = 1800,
	TRACKING_STATE_VALUES = {
		NOT_LOADED: 0,
		LOADING: 1,
		LOADED: 2,
	};

/**
 * Globals
 */

// Used to enqueue the various events while the trackers are still loading so they can be fired afterwards.
let trackingState = TRACKING_STATE_VALUES.NOT_LOADED;
const trackingEventsQueue = [];

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

	if ( isFloodlightEnabled ) {
		setupWpcomFloodlightGtag();
	}

	// Twitter
	if ( isTwitterEnabled ) {
		setupTwitterGlobal();
	}

	// Linkedin
	if ( isLinkedinEnabled ) {
		setupLinkedinGlobal();
	}

	// Quora
	if ( isQuoraEnabled ) {
		setupQuoraGlobal();
	}

	// Outbrain
	if ( isOutbrainEnabled ) {
		setupOutbrainGlobal();
	}

	// Pinterest
	if ( isPinterestEnabled ) {
		setupPinterestGlobal();
	}
}

/**
 * Refreshes the GDPR `country_code` cookie every 6 hours (like A8C_Analytics wpcom plugin).
 *
 * @param {Function} callback - Callback function to call once the `country_code` cookie has been successfully refreshed.
 * @returns {Boolean} Returns `true` if the `country_code` cookie needs to be refreshed.
 */
function maybeRefreshCountryCodeCookieGdpr( callback ) {
	const cookieMaxAgeSeconds = 6 * 60 * 60;
	const cookies = cookie.parse( document.cookie );

	if ( ! cookies.country_code ) {
		// cache buster
		const v = new Date().getTime();

		const handleError = err => {
			document.cookie = cookie.serialize( 'country_code', 'unknown', {
				path: '/',
				maxAge: cookieMaxAgeSeconds,
			} );
			debug( 'refreshGeoIpCountryCookieGdpr Error: ', err );
		};

		const makeRequest = async () => {
			try {
				const res = await fetch( 'https://public-api.wordpress.com/geo/?v=' + v );
				if ( res.ok ) {
					const json = await res.json();
					document.cookie = cookie.serialize( 'country_code', json.country_short, {
						path: '/',
						maxAge: cookieMaxAgeSeconds,
					} );
					callback();
				} else {
					handleError( new Error( await res.body() ) );
				}
			} catch ( err ) {
				handleError( err );
			}
		};

		makeRequest();
		return true;
	}

	return false;
}

/**
 * Initializes Linkedin tracking.
 */
function setupLinkedinGlobal() {
	if ( ! window._linkedin_data_partner_id ) {
		window._linkedin_data_partner_id = TRACKING_IDS.linkedInPartnerId;
	}
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

function setupPinterestGlobal() {
	if ( ! window.pintrk ) {
		window.pintrk = function() {
			window.pintrk.queue.push( Array.prototype.slice.call( arguments ) );
		};
		const n = window.pintrk;
		n.queue = [];
		n.version = '3.0';
	}
}

const loadScript = promisify( loadScriptCallback );

async function loadTrackingScripts( callback ) {
	debug( `loadTrackingScripts: state is ${ trackingState }` );

	trackingEventsQueue.push( callback );
	if ( TRACKING_STATE_VALUES.LOADING === trackingState ) {
		debug( 'loadTrackingScripts: [LOADING] enqueue and return', callback );
		return;
	} else if ( TRACKING_STATE_VALUES.NOT_LOADED === trackingState ) {
		debug( 'loadTrackingScripts: [NOT_LOADED] enqueue and load', callback );
		trackingState = TRACKING_STATE_VALUES.LOADING;
	} else {
		debug( `loadTrackingScripts: [ERROR] unexpected state ${ trackingState }` );
		return;
	}

	const scripts = [];

	if ( isFacebookEnabled ) {
		scripts.push( FACEBOOK_TRACKING_SCRIPT_URL );
	}

	// The Gtag script needs to be loaded with an ID in the URL so we search for the first available one.
	const enabledGtags = [
		isGoogleAnalyticsEnabled && TRACKING_IDS.wpcomGoogleAnalyticsGtag,
		isWpcomGoogleAdsGtagEnabled && TRACKING_IDS.wpcomGoogleAdsGtag,
		isFloodlightEnabled && TRACKING_IDS.wpcomFloodlightGtag,
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

	if ( isTwitterEnabled ) {
		scripts.push( TWITTER_TRACKING_SCRIPT_URL );
	}

	if ( isLinkedinEnabled ) {
		scripts.push( LINKED_IN_SCRIPT_URL );
	}

	if ( isQuoraEnabled ) {
		scripts.push( QUORA_SCRIPT_URL );
	}

	if ( isOutbrainEnabled ) {
		scripts.push( OUTBRAIN_SCRIPT_URL );
	}

	if ( isPinterestEnabled ) {
		scripts.push( PINTEREST_SCRIPT_URL );
	}

	let hasError = false;
	for ( const src of scripts ) {
		try {
			// We use `await` to load each script one by one and allow the GUI to load and be responsive while
			// the trackers get loaded in a user friendly manner.
			await loadScript( src );
		} catch ( error ) {
			hasError = true;
			debug( 'loadTrackingScripts: [Load Error] a tracking script failed to load: ', error );
		}
		debug( 'loadTrackingScripts: [Loaded]', src );
	}

	if ( hasError ) {
		return;
	}

	debug( 'loadTrackingScripts: load done' );

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
		}
	}

	// init Twitter
	if ( isTwitterEnabled ) {
		window.twq( 'init', TRACKING_IDS.twitterPixelId );
	}

	// init Quora
	if ( isQuoraEnabled ) {
		window.qp( 'init', TRACKING_IDS.quoraPixelId );
	}

	// init Pinterest
	if ( isPinterestEnabled ) {
		const normalizedHashedEmail = getNormalizedHashedUserEmail( user );
		const params = normalizedHashedEmail ? { em: normalizedHashedEmail } : {};
		window.pintrk( 'load', TRACKING_IDS.pinterestInit, params );
	}

	debug( 'loadTrackingScripts: init done' );

	// uses JSON.stringify for consistency with recordOrder()
	debug( 'loadTrackingScripts: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );

	// call all enqueued event callbacks
	trackingState = TRACKING_STATE_VALUES.LOADED;
	trackingEventsQueue.forEach( cb => cb() );
	debug( 'loadTrackingScripts: event queue done', trackingEventsQueue );
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
		debug( 'retarget: [Skipping] ad tracking is not allowed', urlPath );
		return;
	}

	if ( TRACKING_STATE_VALUES.LOADED !== trackingState ) {
		loadTrackingScripts( retarget.bind( null, urlPath ) );
		return;
	}

	debug( 'retarget:', urlPath );

	// Non rate limited retargeting (main trackers)

	// Quantcast
	if ( isQuantcastEnabled ) {
		const params = {
			qacct: TRACKING_IDS.quantcast,
			event: 'refresh',
		};
		debug( 'retarget: [Quantcast]', params );
		window._qevents.push( params );
	}

	// Facebook
	if ( isFacebookEnabled ) {
		const params = [ 'trackSingle', TRACKING_IDS.facebookInit, 'PageView' ];
		debug( 'retarget: [Facebook]', params );
		window.fbq( ...params );
	}

	// Bing
	if ( isBingEnabled ) {
		debug( 'retarget: [Bing]' );
		window.uetq.push( 'pageLoad' );
	}

	// Wordpress.com Google Ads Gtag
	if ( isWpcomGoogleAdsGtagEnabled ) {
		const params = [ 'config', TRACKING_IDS.wpcomGoogleAdsGtag, { page_path: urlPath } ];
		debug( 'retarget: [Google Ads] WPCom', params );
		window.gtag( ...params );
	}

	// Floodlight
	recordPageViewInFloodlight( urlPath );

	// Pinterest
	if ( isPinterestEnabled ) {
		debug( 'retarget: [Pinterest]' );
		window.pintrk( 'page' );
	}

	// Rate limited retargeting (secondary trackers)

	const nowTimestamp = Date.now() / 1000;
	if ( nowTimestamp >= lastRetargetTime + retargetingPeriod ) {
		lastRetargetTime = nowTimestamp;

		// Outbrain
		if ( isOutbrainEnabled ) {
			const params = [ 'track', 'PAGE_VIEW' ];
			debug( 'retarget: [Outbrain] [rate limited]', params );
			window.obApi( ...params );
		}

		// Icon Media
		if ( isIconMediaEnabled ) {
			const params = ICON_MEDIA_RETARGETING_PIXEL_URL;
			debug( 'retarget: [Icon Media] [rate limited]', params );
			new Image().src = params;
		}

		// Twitter
		if ( isTwitterEnabled ) {
			const params = [ 'track', 'PageView' ];
			debug( 'retarget: [Twitter] [rate limited]', params );
			window.twq( ...params );
		}

		// Yahoo Gemini
		if ( isGeminiEnabled ) {
			const params = YAHOO_GEMINI_AUDIENCE_BUILDING_PIXEL_URL;
			debug( 'retarget: [Yahoo Gemini] [rate limited]', params );
			new Image().src = params;
		}

		// Quora
		if ( isQuoraEnabled ) {
			const params = [ 'track', 'ViewContent' ];
			debug( 'retarget: [Quora] [rate limited]', params );
			window.qp( ...params );
		}
	}

	// uses JSON.stringify for consistency with recordOrder()
	debug( 'retarget: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
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
	debug( 'trackCustomAdWordsRemarketingEvent:', properties );
	// Not sure this is currently serving any purpose and whether we can convert it to use Gtag.
	// Refactoring the middleware for analytics is outside the scope of this PR so I'll leave the function stub for now.
	/*
	window.google_trackConversion &&
		window.google_trackConversion( {
			google_conversion_id: ADWORDS_CONVERSION_ID,
			google_custom_params: properties,
			google_remarketing_only: true,
		} );
	*/
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
		totalCostUSD: costToUSD( cart.total_cost, cart.currency ),
	};
}

export function recordRegistration() {
	if ( maybeRefreshCountryCodeCookieGdpr( recordRegistration.bind( null ) ) ) {
		return;
	}

	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordRegistration: [Skipping] ad tracking is not allowed' );
		return;
	}

	if ( TRACKING_STATE_VALUES.LOADED !== trackingState ) {
		loadTrackingScripts( recordRegistration.bind( null ) );
		return;
	}

	// Google Ads Gtag

	if ( isWpcomGoogleAdsGtagEnabled ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagRegistration,
			},
		];
		debug( 'recordRegistration: [Google Ads Gtag]', params );
		window.gtag( ...params );
	}

	// Facebook

	if ( isFacebookEnabled ) {
		const params = [ 'trackSingle', TRACKING_IDS.facebookInit, 'Lead' ];
		debug( 'recordRegistration: [Facebook]', params );
		window.fbq( ...params );
	}

	// Bing

	if ( isBingEnabled ) {
		const params = {
			ec: 'registration',
		};
		debug( 'recordRegistration: [Bing]', params );
		window.uetq.push( params );
	}

	// DCM Floodlight

	if ( isFloodlightEnabled ) {
		debug( 'recordRegistration: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/regis0+unique',
		} );
	}

	// Pinterest

	if ( isPinterestEnabled ) {
		const params = [ 'track', 'lead' ];
		debug( 'recordRegistration: [Pinterest]', params );
		window.pintrk( ...params );
	}

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
	if ( maybeRefreshCountryCodeCookieGdpr( recordSignup.bind( null, slug ) ) ) {
		return;
	}

	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordSignup: [Skipping] ad tracking is disallowed' );
		return;
	}

	if ( TRACKING_STATE_VALUES.LOADED !== trackingState ) {
		loadTrackingScripts( recordSignup.bind( null, slug ) );
		return;
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

	// Google Ads Gtag

	if ( isWpcomGoogleAdsGtagEnabled ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagSignup,
				value: syntheticCart.total_cost,
				currency: syntheticCart.currency,
				transaction_id: syntheticOrderId,
			},
		];
		debug( 'recordSignup: [Google Ads Gtag]', params );
		window.gtag( ...params );
	}

	// Bing

	if ( isBingEnabled ) {
		if ( null !== usdCost ) {
			const params = {
				ec: 'signup',
				gv: usdCost,
			};
			debug( 'recordSignup: [Bing]', params );
			window.uetq.push( params );
		} else {
			debug( 'recordSignup: [Bing] currency not supported, dropping WPCom pixel' );
		}
	}

	// Facebook

	if ( isFacebookEnabled ) {
		const params = [
			'trackSingle',
			TRACKING_IDS.facebookInit,
			'Subscribe',
			{
				product_slug: syntheticCart.products.map( product => product.product_slug ).join( ', ' ),
				value: syntheticCart.total_cost,
				currency: syntheticCart.currency,
				user_id: userId,
				order_id: syntheticOrderId,
			},
		];
		debug( 'recordSignup: [Facebook]', params );
		window.fbq( ...params );
	}

	// DCM Floodlight

	if ( isFloodlightEnabled ) {
		debug( 'recordSignup: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/signu1+unique',
		} );
	}

	// Quantcast

	if ( isQuantcastEnabled ) {
		const params = {
			qacct: TRACKING_IDS.quantcast,
			labels:
				'_fp.event.WordPress Signup,_fp.pcat.' +
				syntheticCart.products.map( product => product.product_slug ).join( ' ' ),
			orderid: syntheticOrderId,
			revenue: usdCost,
			event: 'refresh',
		};
		debug( 'recordSignup: [Quantcast]', params );
		window._qevents.push( params );
	}

	// Icon Media

	if ( isIconMediaEnabled ) {
		debug( 'recordSignup: [Icon Media]', ICON_MEDIA_SIGNUP_PIXEL_URL );
		new Image().src = ICON_MEDIA_SIGNUP_PIXEL_URL;
	}

	// Pinterest

	if ( isPinterestEnabled ) {
		const params = [
			'track',
			'signup',
			{
				value: syntheticCart.total_cost,
				currency: syntheticCart.currency,
			},
		];
		debug( 'recordSignup: [Pinterest]', params );
		window.pintrk( ...params );
	}

	// Twitter

	if ( isTwitterEnabled ) {
		const params = [ 'track', 'Signup', {} ];
		debug( 'recordSignup: [Twitter]', params );
		window.twq( ...params );
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
	if ( maybeRefreshCountryCodeCookieGdpr( recordAddToCart.bind( null, cartItem ) ) ) {
		return;
	}

	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordAddToCart: [Skipping] ad tracking is not allowed' );
		return;
	}

	if ( TRACKING_STATE_VALUES.LOADED !== trackingState ) {
		loadTrackingScripts( recordAddToCart.bind( null, cartItem ) );
		return;
	}

	debug( 'recordAddToCart:', cartItem );

	// Google Ads Gtag

	if ( isWpcomGoogleAdsGtagEnabled ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagAddToCart,
			},
		];
		debug( 'recordAddToCart: [Google Ads Gtag] WPCom', params );
		window.gtag( ...params );
	}

	// Facebook

	if ( isFacebookEnabled ) {
		// Fire both WP and JP pixels.

		// WP
		let params = [
			'trackSingle',
			TRACKING_IDS.facebookInit,
			'AddToCart',
			{
				product_slug: cartItem.product_slug,
				free_trial: Boolean( cartItem.free_trial ),
			},
		];
		debug( 'recordAddToCart: [Facebook]', params );
		window.fbq( ...params );

		// Jetpack
		params = [
			'trackSingle',
			TRACKING_IDS.facebookJetpackInit,
			'AddToCart',
			{
				product_slug: cartItem.product_slug,
				free_trial: Boolean( cartItem.free_trial ),
			},
		];
		debug( 'recordAddToCart: [Jetpack]', params );
		window.fbq( ...params );
	}

	// Bing

	if ( isBingEnabled ) {
		const params = {
			ec: 'addtocart',
			el: cartItem.product_slug,
		};
		debug( 'recordAddToCart: [Bing]', params );
		window.uetq.push( params );
	}

	// DCM Floodlight

	if ( isFloodlightEnabled ) {
		debug( 'recordAddToCart: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			u2: cartItem.product_name,
			send_to: 'DC-6355556/wordp0/addto0+standard',
		} );
	}

	// Criteo

	if ( isCriteoEnabled ) {
		const params = [
			'viewItem',
			{
				item: cartItem.product_id,
			},
		];
		debug( 'recordAddToCart: [Criteo]', params );
		recordInCriteo( ...params );
	}

	// Pinterest

	if ( isPinterestEnabled ) {
		const params = [
			'track',
			'addtocart',
			{
				value: cartItem.cost,
				currency: cartItem.currency,
				line_items: [
					{
						product_name: cartItem.product_name,
						product_id: cartItem.product_slug,
					},
				],
			},
		];
		debug( 'recordAddToCart: [Pinterest]', params );
		window.pintrk( ...params );
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
	if ( maybeRefreshCountryCodeCookieGdpr( recordOrder.bind( null, cart, orderId ) ) ) {
		return;
	}

	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordOrder: [Skipping] ad tracking is not allowed' );
		return;
	}

	if ( TRACKING_STATE_VALUES.LOADED !== trackingState ) {
		loadTrackingScripts( recordOrder.bind( null, cart, orderId ) );
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

	// Purchase tracking happens in one of three ways:

	// Fire one tracking event that includes details about the entire order

	const wpcomJetpackCartInfo = splitWpcomJetpackCartInfo( cart );
	debug( 'recordOrder: wpcomJetpackCartInfo:', wpcomJetpackCartInfo );

	recordOrderInGoogleAds( cart, orderId );
	recordOrderInFacebook( cart, orderId );
	recordOrderInFloodlight( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInBing( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInQuantcast( cart, orderId, wpcomJetpackCartInfo );
	recordOrderInCriteo( cart, orderId );

	// Fire a single tracking event without any details about what was purchased

	// Experian / One 2 One Media
	if ( isExperianEnabled ) {
		debug( 'recordOrder: [Experian]', EXPERIAN_CONVERSION_PIXEL_URL );
		new Image().src = EXPERIAN_CONVERSION_PIXEL_URL;
	}

	// Yahoo Gemini
	if ( isGeminiEnabled ) {
		const params =
			YAHOO_GEMINI_CONVERSION_PIXEL_URL + ( usdTotalCost !== null ? '&gv=' + usdTotalCost : '' );
		debug( 'recordOrder: [Yahoo Gemini]', params );
		new Image().src = params;
	}

	if ( isPandoraEnabled ) {
		debug( 'recordOrder: [Pandora]', PANDORA_CONVERSION_PIXEL_URL );
		new Image().src = PANDORA_CONVERSION_PIXEL_URL;
	}

	if ( isQuoraEnabled ) {
		const params = [ 'track', 'Generic' ];
		debug( 'recordOrder: [Quora]', params );
		window.qp( ...params );
	}

	if ( isIconMediaEnabled ) {
		const skus = cart.products.map( product => product.product_slug ).join( ',' );
		const params =
			ICON_MEDIA_ORDER_PIXEL_URL + `&tx=${ orderId }&sku=${ skus }&price=${ usdTotalCost }`;
		debug( 'recordOrder: [Icon Media]', params );
		new Image().src = params;
	}

	// Twitter
	if ( isTwitterEnabled ) {
		const params = [
			'track',
			'Purchase',
			{
				value: cart.total_cost.toString(),
				currency: cart.currency,
				content_name: cart.products.map( product => product.product_name ).join( ',' ),
				content_type: 'product',
				content_ids: cart.products.map( product => product.product_slug ),
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
				line_items: cart.products.map( product => ( {
					product_name: product.product_name,
					product_id: product.product_slug,
					product_price: product.price,
				} ) ),
			},
		];
		debug( 'recordOrder: [Pinterest]', params );
		window.pintrk( ...params );
	}

	// Uses JSON.stringify() to print the expanded object because during localhost or .live testing after firing this
	// event we redirect the user to wordpress.com which causes a domain change preventing the expanding and inspection
	// of any object in the JS console since they are no longer available.
	debug( 'recordOrder: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
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
					wpcomJetpackCartInfo.jetpackProducts.map( product => product.product_slug ).join( ' ' ),
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

	debug( 'recordOrderInFloodlight:' );
	recordParamsInFloodlightGtag( {
		value: wpcomJetpackCartInfo.totalCostUSD,
		transaction_id: orderId,
		u1: wpcomJetpackCartInfo.totalCostUSD,
		u2: cart.products.map( product => product.product_name ).join( ', ' ),
		u3: 'USD',
		send_to: 'DC-6355556/wpsal0/wpsale+transactions',
	} );

	// WPCom
	if ( wpcomJetpackCartInfo.containsWpcomProducts ) {
		debug( 'recordOrderInFloodlight: WPCom' );
		recordParamsInFloodlightGtag( {
			value: wpcomJetpackCartInfo.wpcomCostUSD,
			transaction_id: orderId,
			u1: wpcomJetpackCartInfo.wpcomCostUSD,
			u2: wpcomJetpackCartInfo.wpcomProducts.map( product => product.product_name ).join( ', ' ),
			u3: 'USD',
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
			u2: wpcomJetpackCartInfo.jetpackProducts.map( product => product.product_name ).join( ', ' ),
			u3: 'USD',
			send_to: 'DC-6355556/wpsal0/purch00+transactions',
		} );
	}
}

/**
 * Records an order in Facebook (a single event for the entire order)
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @param {Object} wpcomJetpackCartInfo - info about WPCOM and Jetpack in the cart
 * @returns {void}
 */
function recordOrderInFacebook( cart, orderId ) {
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

	// Fire both WPCom and Jetpack pixels

	// WPCom

	let params = [
		'trackSingle',
		TRACKING_IDS.facebookInit,
		'Purchase',
		{
			product_slug: cart.products.map( product => product.product_slug ).join( ', ' ),
			value: cart.total_cost,
			currency: cart.currency,
			user_id: userId,
			order_id: orderId,
		},
	];
	debug( 'recordOrderInFacebook: WPCom', params );
	window.fbq( ...params );

	// Jetpack

	params = [
		'trackSingle',
		TRACKING_IDS.facebookJetpackInit,
		'Purchase',
		{
			product_slug: cart.products.map( product => product.product_slug ).join( ', ' ),
			value: cart.total_cost,
			currency: cart.currency,
			user_id: userId,
			order_id: orderId,
		},
	];
	debug( 'recordOrderInFacebook: Jetpack', params );
	window.fbq( ...params );
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

	debug( 'recordAliasInFloodlight:' );
	recordParamsInFloodlightGtag( {
		send_to: 'DC-6355556/wordp0/alias0+standard',
	} );
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
 * Record that a user started sign up in DCM Floodlight
 *
 * @returns {void}
 */
export function recordSignupStartInFloodlight() {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'recordSignupStartInFloodlight:' );
	recordParamsInFloodlightGtag( {
		send_to: 'DC-6355556/wordp0/pre-p0+unique',
	} );
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

	debug( 'recordSignupCompletionInFloodlight:' );
	recordParamsInFloodlightGtag( {
		send_to: 'DC-6355556/wordp0/signu0+unique',
	} );
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

	// Set or bump the cookie's expiration date to maintain the session
	document.cookie = cookie.serialize( DCM_FLOODLIGHT_SESSION_COOKIE_NAME, sessionId, {
		maxAge: DCM_FLOODLIGHT_SESSION_LENGTH_IN_SECONDS,
	} );

	debug( 'retarget: recordPageViewInFloodlight: wpvisit' );
	recordParamsInFloodlightGtag( {
		session_id: sessionId,
		u6: urlPath,
		u7: sessionId,
		send_to: 'DC-6355556/wordp0/wpvisit+per_session',
	} );

	debug( 'retarget: recordPageViewInFloodlight: wppv' );
	recordParamsInFloodlightGtag( {
		u6: urlPath,
		u7: sessionId,
		send_to: 'DC-6355556/wordp0/wppv+standard',
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
 * Records Floodlight events using Gtag and automatically adds `u4`, `u5`, and `allow_custom_scripts: true`.
 *
 * @param {Object} params An object of Floodlight params.
 */
function recordParamsInFloodlightGtag( params ) {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	// Adds u4 (user id) and u5 (anonymous user id) parameters
	const defaults = assign( floodlightUserParams(), {
		// See: https://support.google.com/searchads/answer/7566546?hl=en
		allow_custom_scripts: true,
	} );

	const finalParams = [ 'event', 'conversion', assign( {}, defaults, params ) ];

	debug( 'recordParamsInFloodlightGtag:', finalParams );

	window.gtag( ...finalParams );
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
	const params = [
		'viewBasket',
		{
			currency: cart.currency,
			item: cartToCriteoItems( cart ),
		},
	];
	debug( 'recordViewCheckoutInCriteo:', params );
	recordInCriteo( ...params );
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

	const params = [
		'viewItem',
		{
			item: '1',
		},
	];
	debug( 'recordPlansViewInCriteo:', params );
	recordInCriteo( ...params );
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
		debug( 'recordInCriteo: [Skipping] ad tracking is not allowed' );
		return;
	}

	if ( TRACKING_STATE_VALUES.LOADED !== trackingState ) {
		loadTrackingScripts( recordInCriteo.bind( null, eventName, eventProps ) );
		return;
	}

	const events = [];
	events.push( { event: 'setAccount', account: TRACKING_IDS.criteo } );
	events.push( { event: 'setSiteType', type: criteoSiteType() } );

	const normalizedHashedEmail = getNormalizedHashedUserEmail( user );
	if ( normalizedHashedEmail ) {
		events.push( { event: 'setEmail', email: [ normalizedHashedEmail ] } );
	}

	const conversionEvent = clone( eventProps );
	conversionEvent.event = eventName;
	events.push( conversionEvent );

	// The deep clone is necessary because the Criteo script modifies the objects in the
	// array which causes the console to display different data than is originally added
	debug( 'recordInCriteo: ' + eventName, cloneDeep( events ) );
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
 * Records an order/sign_up in Google Ads Gtag
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Number} orderId - the order id
 * @returns {void}
 */
function recordOrderInGoogleAds( cart, orderId ) {
	if ( ! isAdTrackingAllowed() ) {
		debug( 'recordOrderInGoogleAds: skipping as ad tracking is disallowed' );
		return;
	}

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

export function setupGoogleAnalyticsGtag( options ) {
	setupGtag();
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAnalyticsGtag, options );
}

function setupWpcomGoogleAdsGtag() {
	setupGtag();
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAdsGtag );
}

function setupWpcomFloodlightGtag() {
	setupGtag();
	window.gtag( 'config', TRACKING_IDS.wpcomFloodlightGtag );
}

/**
 * Returns whether Google Analytics is allowed.
 *
 * This function returns false if:
 *
 * 1. `isGoogleAnalyticsEnabled` is `true`
 * 2. `ad-tracking` feature is disabled
 * 3. `Do Not Track` is enabled
 * 4. the current user could be in the GDPR zone and hasn't consented to tracking
 * 5. `document.location.href` may contain personally identifiable information
 *
 * Note that doNotTrack() and isPiiUrl() can change at any time which is why we do not cache them.
 *
 * @returns {Boolean} true if GA is allowed.
 */
export function isGoogleAnalyticsAllowed() {
	return (
		isGoogleAnalyticsEnabled &&
		config.isEnabled( 'ad-tracking' ) &&
		! doNotTrack() &&
		! isPiiUrl() &&
		mayWeTrackCurrentUserGdpr()
	);
}

/**
 * Returns the default configuration for Google Analytics
 *
 * @return {Object} GA's default config
 */
export function getGoogleAnalyticsDefaultConfig() {
	return {
		...( user.get() && { user_id: hashPii( user.get().ID ) } ),
		anonymize_ip: true,
		transport_type: 'function' === typeof navigator.sendBeacon ? 'beacon' : 'xhr',
		use_amp_client_id: true,
		custom_map: {
			dimension3: 'client_id',
		},
	};
}

/**
 * Fires Google Analytics page view event
 *
 * @param {String} urlPath The path of the current page
 * @param {String} pageTitle The title of the current page
 */
export function fireGoogleAnalyticsPageView( urlPath, pageTitle ) {
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAnalyticsGtag, {
		...getGoogleAnalyticsDefaultConfig(),
		page_path: urlPath,
		page_title: pageTitle,
	} );
}

/**
 * Fires a generic Google Analytics event
 *
 * @param {String} category Is the string that will appear as the event category.
 * @param {String} action Is the string that will appear as the event action in Google Analytics Event reports.
 * @param {String} label Is the string that will appear as the event label.
 * @param {Integer} value Is a non-negative integer that will appear as the event value.
 */
export function fireGoogleAnalyticsEvent( category, action, label, value ) {
	window.gtag( 'event', action, {
		event_category: category,
		event_label: label,
		value: value,
	} );
}

/**
 * Fires a generic Google Analytics timing
 *
 * @param {String} name A string to identify the variable being recorded (e.g. 'load').
 * @param {Integer} value The number of milliseconds in elapsed time to report to Google Analytics (e.g. 20).
 * @param {String} event_category A string for categorizing all user timing variables into logical groups (e.g. 'JS Dependencies').
 * @param {String} event_label A string that can be used to add flexibility in visualizing user timings in the reports (e.g. 'Google CDN').
 */
export function fireGoogleAnalyticsTiming( name, value, event_category, event_label ) {
	window.gtag( 'event', 'timing_complete', {
		name: name,
		value: value,
		event_category: event_category,
		event_label: event_label,
	} );
}

/**
 * Initializes the Facebook pixel.
 *
 * When the user is logged in, additional hashed data is being forwarded.
 * See https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
 */
function initFacebook() {
	let advancedMatching = {};
	if ( user.get() ) {
		const normalizedHashedEmail = getNormalizedHashedUserEmail( user );
		advancedMatching = normalizedHashedEmail ? { em: normalizedHashedEmail } : {};
	}

	debug( 'initFacebook', advancedMatching );

	// WP Facebook pixel
	window.fbq( 'init', TRACKING_IDS.facebookInit, advancedMatching );

	// Jetpack Facebook pixel
	// Also initialize the FB pixel for Jetpack.
	// However, disable auto-config for this secondary pixel ID.
	// See: <https://developers.facebook.com/docs/facebook-pixel/api-reference#automatic-configuration>
	window.fbq( 'set', 'autoConfig', false, TRACKING_IDS.facebookJetpackInit );
	window.fbq( 'init', TRACKING_IDS.facebookJetpackInit, advancedMatching );
}
