/**
 * Internal dependencies
 */
import {
	isAdRollEnabled,
	isBingEnabled,
	isCriteoEnabled,
	isFacebookEnabled,
	isFloodlightEnabled,
	isLinkedinEnabled,
	isOutbrainEnabled,
	isPinterestEnabled,
	isQuantcastEnabled,
	isQuoraEnabled,
	isTwitterEnabled,
	isWpcomGoogleAdsGtagEnabled,
	ADROLL_PAGEVIEW_PIXEL_URL_1,
	ADROLL_PAGEVIEW_PIXEL_URL_2,
	ADROLL_PURCHASE_PIXEL_URL_1,
	ADROLL_PURCHASE_PIXEL_URL_2,
	TRACKING_IDS,
} from './constants';

import { setupGtag } from './setup-gtag';

if ( typeof window !== 'undefined' ) {
	setupGtag();

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

	// AdRoll
	if ( isAdRollEnabled ) {
		setupAdRollGlobal();
	}
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

function setupWpcomGoogleAdsGtag() {
	setupGtag();
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAdsGtag );
}

function setupWpcomFloodlightGtag() {
	setupGtag();
	window.gtag( 'config', TRACKING_IDS.wpcomFloodlightGtag );
}
