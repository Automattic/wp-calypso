/**
 * External dependencies
 */
const async = require( 'async' ),
	noop = require( 'lodash/utility/noop' ),
	map = require( 'lodash/collection/map' ),
	some = require( 'lodash/collection/some' ),
	debug = require( 'debug' )( 'calypso:ad-tracking' );

/**
 * Internal dependencies
 */
const loadScript = require( 'lib/load-script' ),
	config = require( 'config' ),
	isPremium = require( 'lib/products-values' ).isPremium,
	isBusiness = require( 'lib/products-values' ).isBusiness;

/**
 * Module variables
 */
let hasLoadedScripts = false,
	retargetingInitialized = false;

/**
 * Constants
 */
const FACEBOOK_TRACKING_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbds.js',
	GOOGLE_TRACKING_SCRIPT_URL = 'https://www.googleadservices.com/pagead/conversion_async.js',
	BING_TRACKING_SCRIPT_URL = 'https://bat.bing.com/bat.js',
	GOOGLE_CONVERSION_ID = config( 'google_adwords_conversion_id' ),
	TRACKING_IDS = {
		freeSignup: {
			facebook: '6024523283021',
			google: 'd-fNCIe7m1wQ1uXz_AM'
		},

		premiumTrial: {
			facebook: '6028365445821',
			google: '_q3ECJ--m1wQ1uXz_AM'
		},

		premiumSignup: {
			facebook: '6028365447021',
			google: 'UMSeCIyYmFwQ1uXz_AM',
			bing: '4074038'
		},

		businessTrial: {
			facebook: '6028365448821',
			google: 'm9zRCNO8m1wQ1uXz_AM'
		},

		businessSignup: {
			facebook: '6028365461821',
			google: 'JxKBCKK-m1wQ1uXz_AM',
			bing: '4074039'
		},

		retargeting: '823166884443641'
	};

/**
 * Globals
 */
if ( ! window._fbq ) {
	window._fbq = []; // Facebook global
}

if ( ! window.uetq ) {
	window.uetq = []; // Bing global
}

function loadTrackingScripts( callback ) {
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
			hasLoadedScripts = true;

			// update Facebook's tracking global
			window._fbq.loaded = true;
			window._fbq.push( [ 'addPixelId', TRACKING_IDS.retargeting ] );

			if ( typeof callback === 'function' ) {
				callback();
			}
		} else {
			debug( 'Some scripts failed to load: ', errors );
		}
	} );
}

function retarget() {
	if ( ! hasLoadedScripts ) {
		return loadTrackingScripts( retarget );
	}

	if ( ! retargetingInitialized ) {
		debug( 'Retargeting initialized' );

		window._fbq.push( [ 'track', 'PixelInitialized', {} ] );
		retargetingInitialized = true;
	}
}

function recordPurchase( product ) {
	let type;

	if ( ! hasLoadedScripts ) {
		return loadTrackingScripts( function() {
			recordPurchase( type );
		} );
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

	if ( ! type ) {
		return;
	}

	debug( 'Recorded purchase', type );

	// record the purchase w/ Facebook
	window._fbq.push( [
		'track',
		TRACKING_IDS[ type ].facebook,
		{
			value: '0.00',
			currency: 'USD'
		}
	] );

	// record the purchase w/ Google
	window.google_trackConversion( {
		google_conversion_id: GOOGLE_CONVERSION_ID,
		google_conversion_label: TRACKING_IDS[ type ].google,
		google_remarketing_only: false
	} );

	// record the purchase w/ Bing if a tracking ID is present
	if ( TRACKING_IDS[ type ].bing ) {
		window.uetq = new UET( {
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

	recordPurchases: function( products ) {
		if ( config.isEnabled( 'ad-tracking' ) ) {
			map( products, recordPurchase );
		}
	}
};
