/**
 * External dependencies
 */
import async from 'async';
import noop from 'lodash/utility/noop';
import some from 'lodash/collection/some';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:ad-tracking' );

/**
 * Internal dependencies
 */
import loadScript from 'lib/load-script';
import config from 'config';
import { isBusiness, isPremium } from 'lib/products-values';

/**
 * Module variables
 */
let hasStartedFetchingScripts = false,
	retargetingInitialized = false;

/**
 * Constants
 */
const FACEBOOK_TRACKING_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js',
	GOOGLE_TRACKING_SCRIPT_URL = 'https://www.googleadservices.com/pagead/conversion_async.js',
	BING_TRACKING_SCRIPT_URL = 'https://bat.bing.com/bat.js',
	GOOGLE_CONVERSION_ID = config( 'google_adwords_conversion_id' ),
	TRACKING_IDS = {
		facebookInit: '823166884443641',

		freeSignup: {
			google: 'd-fNCIe7m1wQ1uXz_AM'
		},

		premiumTrial: {
			google: '_q3ECJ--m1wQ1uXz_AM'
		},

		premiumSignup: {
			google: 'UMSeCIyYmFwQ1uXz_AM',
			bing: '4074038'
		},

		businessTrial: {
			google: 'm9zRCNO8m1wQ1uXz_AM'
		},

		businessSignup: {
			google: 'JxKBCKK-m1wQ1uXz_AM',
			bing: '4074039'
		},

		retargeting: '823166884443641'
	};

/**
 * Globals
 */
if ( ! window.fbq ) {
	setUpFacebookGlobal();
}

if ( ! window.uetq ) {
	window.uetq = []; // Bing global
}

/**
 * This sets up the globals that the Facebook event library expects.
 * More info here: https://www.facebook.com/business/help/952192354843755
 */
function setUpFacebookGlobal() {
	const facebookEvents = window.fbq = function() {
		if ( facebookEvents.callMethod ) {
			facebookEvents.callMethod.apply( facebookEvents, arguments );
		} else {
			facebookEvents.queue.push( arguments );
		}
	};

	if ( ! window._fbq ) {
		window._fbq = facebookEvents;
	}

	facebookEvents.push = facebookEvents;
	facebookEvents.loaded = true;
	facebookEvents.version = '2.0';
	facebookEvents.queue = [];
}

function loadTrackingScripts( callback ) {
	hasStartedFetchingScripts = true;

	async.parallel( [
		function( onComplete ) {
			loadScript.loadScript( FACEBOOK_TRACKING_SCRIPT_URL, onComplete );
		},
		function( onComplete ) {
			loadScript.loadScript( GOOGLE_TRACKING_SCRIPT_URL, onComplete );
		},
		function( onComplete ) {
			loadScript.loadScript( BING_TRACKING_SCRIPT_URL, onComplete );
		}
	], function( errors ) {
		if ( ! some( errors ) ) {
			// update Facebook's tracking global
			window.fbq( 'init', TRACKING_IDS.facebookInit );

			if ( typeof callback === 'function' ) {
				callback();
			}
		} else {
			debug( 'Some scripts failed to load: ', errors );
		}
	} );
}

function retarget() {
	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( retarget );
	}

	if ( ! retargetingInitialized ) {
		debug( 'Retargeting initialized' );

		window.fbq( 'track', 'PageView' );
		retargetingInitialized = true;
	}
}

function recordAddToCart( cartItem ) {
	if ( ! config.isEnabled( 'ad-tracking' ) ) {
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( recordAddToCart.bind( null, cartItem ) );
	}

	debug( 'Recorded that this item was added to the cart', cartItem );

	window.fbq(
		'track',
		'AddToCart',
		{
			product_slug: cartItem.product_slug,
			free_trial: Boolean( cartItem.free_trial )
		}
	)
}

function recordPurchase( product ) {
	let type;

	if ( ! config.isEnabled( 'ad-tracking' ) ) {
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( recordPurchase.bind( null, product ) );
	}

	if ( isPremium( product ) ) {
		if ( 0 === product.cost ) {
			type = 'premiumTrial';
		} else {
			type = 'premiumSignup';
		}
	}

	if ( isBusiness( product ) ) {
		if ( 0 === product.cost ) {
			type = 'businessTrial';
		} else {
			type = 'businessSignup';
		}
	}

	debug( 'Recorded purchase', type );

	// record the purchase w/ Facebook
	window.fbq(
		'track',
		'Purchase',
		{
			currency: product.currency,
			product_slug: product.product_slug,
			value: product.cost
		}
	);

	// record the purchase w/ Google if a tracking ID is present
	if ( TRACKING_IDS[ type ] && TRACKING_IDS[ type ].google ) {
		window.google_trackConversion( {
			google_conversion_id: GOOGLE_CONVERSION_ID,
			google_conversion_label: TRACKING_IDS[ type ].google,
			google_remarketing_only: false
		} );
	}

	// record the purchase w/ Bing if a tracking ID is present
	if ( TRACKING_IDS[ type ] && TRACKING_IDS[ type ].bing && typeof UET !== 'undefined' ) {
		window.uetq = new UET( { // eslint-disable-line no-undef
			ti: TRACKING_IDS[ type ].bing,
			o: window.uetq
		} );
		window.uetq.push( 'pageLoad' );
		window.uetq.push( { ec: 'conversion' } );
	}
}

module.exports = {
	retarget: function( context, next ) {
		const nextFunction = typeof next === 'function' ? next : noop;

		if ( config.isEnabled( 'ad-tracking' ) ) {
			retarget();
		}

		nextFunction();
	},

	recordAddToCart,
	recordPurchase
};
