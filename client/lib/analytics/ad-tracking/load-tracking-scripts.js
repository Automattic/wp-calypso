import { getCurrentUser } from '@automattic/calypso-analytics';
import { loadScript } from '@automattic/load-script';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { mayWeInitTracker, mayWeTrackByTracker } from '../tracker-buckets';
import {
	debug,
	TRACKING_IDS,
	FACEBOOK_TRACKING_SCRIPT_URL,
	GOOGLE_GTAG_SCRIPT_URL,
	BING_TRACKING_SCRIPT_URL,
	CRITEO_TRACKING_SCRIPT_URL,
	TWITTER_TRACKING_SCRIPT_URL,
	LINKED_IN_SCRIPT_URL,
	QUORA_SCRIPT_URL,
	OUTBRAIN_SCRIPT_URL,
	PINTEREST_SCRIPT_URL,
	GOOGLE_GTM_SCRIPT_URL,
	WPCOM_CLARITY_URI,
	REDDIT_TRACKING_SCRIPT_URL,
	WPCOM_REDDIT_PIXEL_ID,
} from './constants';
import { circularReferenceSafeJSONStringify } from './debug';
import { setup } from './setup';

export const loadTrackingScripts = attemptLoad( async () => {
	setup();

	const scripts = getTrackingScriptsToLoad();

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
		throw new Error( 'One or more tracking scripts failed to load' );
	}

	debug( 'loadTrackingScripts: load done' );

	initLoadedTrackingScripts();

	// uses JSON.stringify for consistency with recordOrder()
	debug(
		'loadTrackingScripts: dataLayer:',
		circularReferenceSafeJSONStringify( window.dataLayer, 2 )
	);

	return scripts;
} );

function getTrackingScriptsToLoad() {
	const scripts = [];

	if ( mayWeTrackByTracker( 'facebook' ) ) {
		scripts.push( FACEBOOK_TRACKING_SCRIPT_URL );
	}

	// The Gtag script needs to be loaded with an ID in the URL so we search for the first available one.
	const enabledGtags = [
		mayWeTrackByTracker( 'googleAds' ) && TRACKING_IDS.wpcomGoogleAdsGtag,
		mayWeTrackByTracker( 'floodlight' ) && TRACKING_IDS.wpcomFloodlightGtag,
	].filter( ( id ) => false !== id );
	if ( enabledGtags.length > 0 ) {
		scripts.push( GOOGLE_GTAG_SCRIPT_URL + enabledGtags[ 0 ] );
	}

	if ( mayWeTrackByTracker( 'bing' ) ) {
		scripts.push( BING_TRACKING_SCRIPT_URL );
	}

	if ( mayWeTrackByTracker( 'criteo' ) ) {
		scripts.push( CRITEO_TRACKING_SCRIPT_URL );
	}

	if ( mayWeTrackByTracker( 'quantcast' ) ) {
		scripts.push( quantcastAsynchronousTagURL() );
	}

	if ( mayWeTrackByTracker( 'twitter' ) ) {
		scripts.push( TWITTER_TRACKING_SCRIPT_URL );
	}

	if ( mayWeTrackByTracker( 'linkedin' ) ) {
		scripts.push( LINKED_IN_SCRIPT_URL );
	}

	if ( mayWeTrackByTracker( 'quora' ) ) {
		scripts.push( QUORA_SCRIPT_URL );
	}

	if ( mayWeTrackByTracker( 'outbrain' ) ) {
		scripts.push( OUTBRAIN_SCRIPT_URL );
	}

	if ( mayWeTrackByTracker( 'pinterest' ) ) {
		scripts.push( PINTEREST_SCRIPT_URL );
	}

	if ( mayWeInitTracker( 'googleTagManager' ) && isAkismetCheckout() ) {
		scripts.push( GOOGLE_GTM_SCRIPT_URL + TRACKING_IDS.akismetGoogleTagManagerId );
	}

	if ( mayWeInitTracker( 'googleTagManager' ) && ( isJetpackCloud() || isJetpackCheckout() ) ) {
		scripts.push( GOOGLE_GTM_SCRIPT_URL + TRACKING_IDS.jetpackGoogleTagManagerId );
	}

	if ( mayWeTrackByTracker( 'clarity' ) ) {
		scripts.push( WPCOM_CLARITY_URI );
	}

	if ( mayWeTrackByTracker( 'reddit' ) ) {
		scripts.push( REDDIT_TRACKING_SCRIPT_URL );
	}

	return scripts;
}

function initLoadedTrackingScripts() {
	// init Facebook
	if ( mayWeTrackByTracker( 'facebook' ) ) {
		initFacebook();
	}

	// init Bing
	if ( mayWeTrackByTracker( 'bing' ) ) {
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
	if ( mayWeTrackByTracker( 'twitter' ) ) {
		if ( isJetpackCloud() || isJetpackCheckout() ) {
			window.twq( 'config', TRACKING_IDS.jetpackTwitterPixelId );
		} else {
			window.twq( 'init', TRACKING_IDS.twitterPixelId );
		}
	}

	// init Quora
	if ( mayWeTrackByTracker( 'quora' ) ) {
		window.qp( 'init', TRACKING_IDS.quoraPixelId );
	}

	// init Pinterest
	if ( mayWeTrackByTracker( 'pinterest' ) ) {
		const currentUser = getCurrentUser();
		const params = currentUser ? { em: currentUser.hashedPii.email } : {};
		window.pintrk( 'load', TRACKING_IDS.pinterestInit, params );
	}

	if ( mayWeTrackByTracker( 'reddit' ) ) {
		const params = {
			optOut: false,
			useDecimalCurrencyValues: true,
		};

		window.rdt( 'init', WPCOM_REDDIT_PIXEL_ID, params );
	}

	debug( 'loadTrackingScripts: init done' );
}

// Returns a function that has the following behavior:
// - when called, tries to call `loader` and returns a promise that resolves when load is finished
// - when `loader` is already in progress, don't issue two concurrent calls: wait for the first to finish
// - when `loader` fails, DON'T return a rejected promise. Instead, leave it unresolved and let the caller
//   wait, potentially forever. Next call to the loader function has a chance to succeed and resolve the
//   promise, for the current and all previous callers. That effectively implements a queue.
function attemptLoad( loader ) {
	let setLoadResult;
	let loadResult;
	let status = 'not-loading';

	function initiateLoad() {
		loadResult = new Promise( ( resolve ) => {
			setLoadResult = resolve;
		} );

		loader().then(
			( result ) => {
				status = 'loaded';
				setLoadResult( result );
			},
			() => {
				status = 'not-loading';
			}
		);
	}

	return ( reload = false ) => {
		if ( status === 'not-loading' || reload ) {
			if ( reload ) {
				status = 'not-loading';
			}
			initiateLoad();
		}
		return loadResult;
	};
}

/**
 * Returns the URL for Quantcast's Purchase Confirmation Tag
 * @see https://www.quantcast.com/help/guides/using-the-quantcast-asynchronous-tag/
 * @returns {string} The URL
 */
function quantcastAsynchronousTagURL() {
	const protocolAndSubdomain =
		document.location.protocol === 'https:' ? 'https://secure' : 'http://edge';

	return protocolAndSubdomain + '.quantserve.com/quant.js';
}

/**
 * Initializes the Facebook pixel.
 *
 * When the user is logged in, additional hashed data is being forwarded.
 * See https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
 */
function initFacebook() {
	let advancedMatching = {};
	const currentUser = getCurrentUser();

	if ( currentUser ) {
		advancedMatching = { em: currentUser.hashedPii.email };
	}

	debug( 'initFacebook', advancedMatching );

	// WP Facebook pixel
	window.fbq( 'init', TRACKING_IDS.facebookInit, advancedMatching );

	// Jetpack & Akismet Facebook pixel
	// Also initialize the FB pixel for Jetpack & Akismet.
	// However, disable auto-config for this secondary pixel ID.
	// See: <https://developers.facebook.com/docs/facebook-pixel/api-reference#automatic-configuration>
	if ( isJetpackCheckout() ) {
		window.fbq( 'set', 'autoConfig', false, TRACKING_IDS.facebookJetpackInit );
		window.fbq( 'init', TRACKING_IDS.facebookJetpackInit, advancedMatching );
		window.fbq( 'track', 'PageView' ); // When autoConfig=false, page view tracking must be manually triggered
	}
	if ( isAkismetCheckout() ) {
		window.fbq( 'set', 'autoConfig', false, TRACKING_IDS.facebookAkismetInit );
		window.fbq( 'init', TRACKING_IDS.facebookAkismetInit, advancedMatching );
		window.fbq( 'track', 'PageView' ); // When autoConfig=false, page view tracking must be manually triggered
	}
}
