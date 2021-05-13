/**
 * External dependencies
 */
import { loadScript } from '@automattic/load-script';

/**
 * Internal dependencies
 */
import { getCurrentUser } from '@automattic/calypso-analytics';

import {
	debug,
	isFacebookEnabled,
	isBingEnabled,
	isCriteoEnabled,
	isQuantcastEnabled,
	isWpcomGoogleAdsGtagEnabled,
	isFloodlightEnabled,
	isTwitterEnabled,
	isLinkedinEnabled,
	isQuoraEnabled,
	isOutbrainEnabled,
	isPinterestEnabled,
	isGoogleAnalyticsEnabled,
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
} from './constants';

// Ensure setup has run.
import './setup';

export const loadTrackingScripts = attemptLoad( async () => {
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
	debug( 'loadTrackingScripts: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
} );

function getTrackingScriptsToLoad() {
	const scripts = [];

	if ( isFacebookEnabled ) {
		scripts.push( FACEBOOK_TRACKING_SCRIPT_URL );
	}

	// The Gtag script needs to be loaded with an ID in the URL so we search for the first available one.
	const enabledGtags = [
		isGoogleAnalyticsEnabled && TRACKING_IDS.wpcomGoogleAnalyticsGtag,
		isWpcomGoogleAdsGtagEnabled && TRACKING_IDS.wpcomGoogleAdsGtag,
		isFloodlightEnabled && TRACKING_IDS.wpcomFloodlightGtag,
	].filter( ( id ) => false !== id );
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

	return scripts;
}

function initLoadedTrackingScripts() {
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
		const currentUser = getCurrentUser();
		const params = currentUser ? { em: currentUser.hashedPii.email } : {};
		window.pintrk( 'load', TRACKING_IDS.pinterestInit, params );
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
	let status = 'not-loading';

	const loadResult = new Promise( ( resolve ) => {
		setLoadResult = resolve;
	} );

	return () => {
		if ( status === 'not-loading' ) {
			status = 'loading';
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
		return loadResult;
	};
}

/**
 * Returns the URL for Quantcast's Purchase Confirmation Tag
 *
 * @see https://www.quantcast.com/help/guides/using-the-quantcast-asynchronous-tag/
 *
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

	// Jetpack Facebook pixel
	// Also initialize the FB pixel for Jetpack.
	// However, disable auto-config for this secondary pixel ID.
	// See: <https://developers.facebook.com/docs/facebook-pixel/api-reference#automatic-configuration>
	window.fbq( 'set', 'autoConfig', false, TRACKING_IDS.facebookJetpackInit );
	window.fbq( 'init', TRACKING_IDS.facebookJetpackInit, advancedMatching );
}
