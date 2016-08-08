/**
 * External dependencies
 */
import async from 'async';
import noop from 'lodash/noop';
import some from 'lodash/some';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:ad-tracking' );

/**
 * Internal dependencies
 */
import loadScript from 'lib/load-script';
import config from 'config';
import productsValues from 'lib/products-values';
import userModule from 'lib/user';

/**
 * Module variables
 */
const user = userModule();
let hasStartedFetchingScripts = false,
	hasFinishedFetchingScripts = false,
	retargetingInitialized = false;

/**
 * Constants
 */
const FACEBOOK_TRACKING_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js',
	ATLAS_TRACKING_SCRIPT_URL = 'https://ad.atdmt.com/m/a.js',
	GOOGLE_TRACKING_SCRIPT_URL = 'https://www.googleadservices.com/pagead/conversion_async.js',
	BING_TRACKING_SCRIPT_URL = 'https://bat.bing.com/bat.js',
	GOOGLE_CONVERSION_ID = config( 'google_adwords_conversion_id' ),
	ONE_BY_AOL_PIXEL_URL = 'https://secure.ace-tag.advertising.com/action/type=132958/bins=1/rich=0/Mnum=1516/',
	TRACKING_IDS = {
		bingInit: '4074038',
		facebookInit: '823166884443641',
		googleConversionLabel: 'MznpCMGHr2MQ1uXz_AM',
		googleConversionLabelJetpack: '0fwbCL35xGIQqv3svgM',
		atlasUniveralTagId: '11187200770563'
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

			// update Bing's tracking global
			const bingConfig = {
				ti: TRACKING_IDS.bingInit,
				q: window.uetq
			};

			if ( typeof UET !== 'undefined' ) {
				// bing's script creates the UET global for us
				window.uetq = new UET( bingConfig ); // eslint-disable-line
				window.uetq.push( 'pageLoad' );
			}

			hasFinishedFetchingScripts = true;

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

	// The reason we check whether the scripts have finished is to avoid a situation
	// where retarget is called once (which starts the load process) then immediately
	// again (in which case they've started to be fetched, but haven't finished) which
	// would cause an undefined function error for `google_trackConversion` below.
	if ( hasFinishedFetchingScripts && ! retargetingInitialized ) {
		debug( 'Retargeting initialized' );

		retargetingInitialized = true;

		// Facebook
		window.fbq( 'track', 'PageView' );

		// AdWords
		window.google_trackConversion( {
			google_conversion_id: GOOGLE_CONVERSION_ID,
			google_remarketing_only: true
		} );
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
	);
}

/**
 * Recorders an individual product purchase conversion
 *
 * @param {Object} product - the product
 * @param {Number} orderId - the order id
 * @returns {void}
 */
function recordPurchase( product, orderId ) {
	if ( ! config.isEnabled( 'ad-tracking' ) ) {
		return;
	}

	if ( ! hasStartedFetchingScripts ) {
		return loadTrackingScripts( recordPurchase.bind( null, product, orderId ) );
	}

	const isJetpackPlan = productsValues.isJetpackPlan( product );

	if ( isJetpackPlan ) {
		debug( 'Recording Jetpack purchase', product );
	} else {
		debug( 'Recording purchase', product );
	}

	// record the user id as a custom parameter
	const currentUser = user.get(),
		userId = currentUser ? currentUser.ID : 0;

	// record the purchase w/ Facebook
	window.fbq(
		'track',
		'Purchase',
		{
			currency: product.currency,
			product_slug: product.product_slug,
			value: product.cost,
			user_id: userId,
			order_id: orderId
		}
	);

	// record the purchase w/ Bing if it is made with USD - Bing doesn't handle multiple currencies
	if ( 'USD' === product.currency ) {
		window.uetq.push( {
			ec: 'purchase',
			gv: product.cost
		} );
	}

	// record the purchase w/ Google
	window.google_trackConversion( {
		google_conversion_id: GOOGLE_CONVERSION_ID,
		google_conversion_label: isJetpackPlan
			? TRACKING_IDS.googleConversionLabelJetpack
			: TRACKING_IDS.googleConversionLabel,
		google_conversion_value: product.cost,
		google_conversion_currency: product.currency,
		google_custom_params: {
			product_slug: product.product_slug,
			user_id: userId,
			order_id: orderId
		},
		google_remarketing_only: false
	} );
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
	if ( ! config.isEnabled( 'ad-tracking' ) ) {
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
		order_id: orderId
	};

	const urlParams = Object.keys( params ).map( function( key ) {
		return encodeURIComponent( key ) + '=' + encodeURIComponent( params[ key ] );
	} ).join( '&' );

	const urlWithParams = ATLAS_TRACKING_SCRIPT_URL + ';m=' + TRACKING_IDS.atlasUniveralTagId +
		';cache=' + Math.random() + '?' + urlParams;

	loadScript.loadScript( urlWithParams );
}

/**
 * Tracks the purchase conversion with One by AOL
 *
 * @note One by AOL does not record any specifics about the purchase
 */
function recordConversionInOneByAOL() {
	if ( ! config.isEnabled( 'ad-tracking' ) ) {
		return;
	}

	new Image().src = ONE_BY_AOL_PIXEL_URL;
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
	recordPurchase,
	recordOrderInAtlas,
	recordConversionInOneByAOL
};
