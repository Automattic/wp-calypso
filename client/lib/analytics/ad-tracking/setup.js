import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { mayWeInitTracker, mayWeTrackByTracker } from '../tracker-buckets';
import {
	ADROLL_PAGEVIEW_PIXEL_URL_1,
	ADROLL_PAGEVIEW_PIXEL_URL_2,
	ADROLL_PURCHASE_PIXEL_URL_1,
	ADROLL_PURCHASE_PIXEL_URL_2,
	TRACKING_IDS,
} from './constants';

/**
 * Checks if the current page is a signup or checkout page
 * @returns {boolean} True if the current page is a signup or checkout page
 */
const isSignupOrCheckoutPage = () => {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	const path = window.location.pathname;
	return (
		path.startsWith( '/checkout' ) || path.startsWith( '/start' ) || path.startsWith( '/setup' )
	);
};

export function setup() {
	if ( typeof window !== 'undefined' ) {
		if ( mayWeInitTracker( 'ga' ) ) {
			setupGtag();
		}

		// Facebook
		if ( mayWeInitTracker( 'facebook' ) ) {
			setupFacebookGlobal();
		}

		// Bing
		if ( mayWeInitTracker( 'bing' ) && ! window.uetq ) {
			window.uetq = [];
		}

		// Criteo
		if ( mayWeInitTracker( 'criteo' ) && ! window.criteo_q ) {
			window.criteo_q = [];
		}

		// Quantcast
		if ( mayWeInitTracker( 'quantcast' ) && ! window._qevents ) {
			window._qevents = [];
		}

		// Google Ads Gtag for wordpress.com
		if ( mayWeInitTracker( 'googleAds' ) ) {
			setupWpcomGoogleAdsGtag();
		}

		if ( mayWeInitTracker( 'floodlight' ) ) {
			setupWpcomFloodlightGtag();
		}

		// Twitter
		if ( mayWeInitTracker( 'twitter' ) ) {
			setupTwitterGlobal();
		}

		// Linkedin
		if ( mayWeInitTracker( 'linkedin' ) && isSignupOrCheckoutPage() ) {
			setupLinkedinInsight(
				isJetpackCloud() || isJetpackCheckout()
					? TRACKING_IDS.jetpackLinkedinId
					: TRACKING_IDS.wpcomLinkedinId
			);
		}

		// Quora
		if ( mayWeInitTracker( 'quora' ) ) {
			setupQuoraGlobal();
		}

		// Outbrain
		if ( mayWeInitTracker( 'outbrain' ) ) {
			setupOutbrainGlobal();
		}

		// Pinterest
		if ( mayWeInitTracker( 'pinterest' ) ) {
			setupPinterestGlobal();
		}

		// AdRoll
		if ( mayWeInitTracker( 'adroll' ) ) {
			setupAdRollGlobal();
		}

		// GTM
		if ( mayWeInitTracker( 'googleTagManager' ) ) {
			setupGtmGtag();
		}

		if ( mayWeInitTracker( 'clarity' ) ) {
			setupClarityGlobal();
		}

		// Reddit
		if ( mayWeInitTracker( 'reddit' ) ) {
			setupRedditGlobal();
		}
	}
}

setup();

/**
 * Initializes Linkedin tracking.
 */
function setupLinkedinInsight( partnerId ) {
	window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
	window._linkedin_data_partner_ids.push( partnerId );

	if ( ! window.lintrk ) {
		window.lintrk = function ( a, b ) {
			window.lintrk.q.push( [ a, b ] );
		};
		window.lintrk.q = [];
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

	const quoraPixel = ( window.qp = function () {
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

	const facebookEvents = ( window.fbq = function () {
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

	const twq = ( window.twq = function () {
		twq.exe ? twq.exe.apply( twq, arguments ) : twq.queue.push( arguments );
	} );
	twq.version = '1.1';
	twq.queue = [];
}

function setupOutbrainGlobal() {
	const api = ( window.obApi = function () {
		api.dispatch ? api.dispatch.apply( api, arguments ) : api.queue.push( arguments );
	} );
	api.version = '1.0';
	api.loaded = true;
	api.marketerId = TRACKING_IDS.outbrainAdvId;
	api.queue = [];
}

function setupPinterestGlobal() {
	if ( ! window.pintrk ) {
		window.pintrk = function () {
			window.pintrk.queue.push( Array.prototype.slice.call( arguments ) );
		};
		const n = window.pintrk;
		n.queue = [];
		n.version = '3.0';
	}
}

function setupAdRollGlobal() {
	if ( ! window.adRoll ) {
		window.adRoll = {
			trackPageview: function () {
				new window.Image().src = ADROLL_PAGEVIEW_PIXEL_URL_1;
				new window.Image().src = ADROLL_PAGEVIEW_PIXEL_URL_2;
			},
			trackPurchase: function () {
				new window.Image().src = ADROLL_PURCHASE_PIXEL_URL_1;
				new window.Image().src = ADROLL_PURCHASE_PIXEL_URL_2;
			},
		};
	}
}

/**
 * Sets up the base Reddit advertising pixel.
 */
function setupRedditGlobal() {
	window.rdt =
		window.rdt ||
		function ( ...args ) {
			window.rdt.sendEvent ? window.rdt.sendEvent( ...args ) : window.rdt.callQueue.push( args );
		};

	window.rdt.callQueue = [];
}

function setupGtag() {
	if ( window.dataLayer && window.gtag ) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.gtag = function () {
		window.dataLayer.push( arguments );
	};
	window.gtag( 'js', new Date() );
	window.gtag( 'consent', 'default', {
		ad_storage: 'granted',
		analytics_storage: 'granted',
		ad_user_data: 'granted',
		ad_personalization: 'granted',
	} );
}

function setupWpcomGoogleAdsGtag() {
	setupGtag();

	if ( mayWeTrackByTracker( 'googleAds' ) ) {
		window.gtag( 'config', TRACKING_IDS.wpcomGoogleAdsGtag );
	}
}

function setupWpcomFloodlightGtag() {
	setupGtag();

	if ( mayWeTrackByTracker( 'floodlight' ) ) {
		window.gtag( 'config', TRACKING_IDS.wpcomFloodlightGtag );
	}
}

function setupGtmGtag() {
	if ( isAkismetCheckout() ) {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push( { 'gtm.start': new Date().getTime(), event: 'gtm.js' } );
	}
}

/**
 * This sets up the global window.clarity method that Clarity expects to be set before the script is loaded.
 * @returns {void}
 */
function setupClarityGlobal() {
	if ( window.clarity ) {
		return;
	}
	window.clarity =
		window.clarity ||
		function () {
			( window.clarity.q = window.clarity.q || [] ).push( arguments );
		};
}
