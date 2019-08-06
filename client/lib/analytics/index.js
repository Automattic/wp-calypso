/**
 * External dependencies
 */
import cookie from 'cookie';
import debug from 'debug';
import { parse } from 'qs';
import url from 'url';
import { assign, includes, isObjectLike, isUndefined, omit, pickBy, times } from 'lodash';
import { loadScript } from '@automattic/load-script';

/**
 * Internal dependencies
 */
import config from 'config';
import emitter from 'lib/mixins/emitter';
import { ANALYTICS_SUPER_PROPS_UPDATE } from 'state/action-types';
import {
	mayWeTrackCurrentUserGdpr,
	doNotTrack,
	isPiiUrl,
	shouldReportOmitBlogId,
	costToUSD,
	urlParseAmpCompatible,
	saveCouponQueryArgument,
} from 'lib/analytics/utils';
import {
	retarget as retargetAdTrackers,
	recordAliasInFloodlight,
	recordSignupCompletionInFloodlight,
	recordSignupStartInFloodlight,
	recordRegistration,
	recordSignup,
	recordAddToCart,
	recordOrder,
	setupGoogleAnalyticsGtag,
	isGoogleAnalyticsAllowed,
	fireGoogleAnalyticsPageView,
	fireGoogleAnalyticsEvent,
	fireGoogleAnalyticsTiming,
} from 'lib/analytics/ad-tracking';
import { updateQueryParamsTracking } from 'lib/analytics/sem';
import { statsdTimingUrl, statsdCountingUrl } from 'lib/analytics/statsd';
import { isE2ETest } from 'lib/e2e';
import { getGoogleAnalyticsDefaultConfig } from './ad-tracking';
import { affiliateReferral as trackAffiliateReferral } from 'state/refer/actions';
import { reduxDispatch } from 'lib/redux-bridge';
import { getFeatureSlugFromPageUrl } from './feature-slug';

/**
 * Module variables
 */
const pvDebug = debug( 'calypso:analytics:pv' );
const mcDebug = debug( 'calypso:analytics:mc' );
const gaDebug = debug( 'calypso:analytics:ga' );
const referDebug = debug( 'calypso:analytics:refer' );
const queueDebug = debug( 'calypso:analytics:queue' );
const hotjarDebug = debug( 'calypso:analytics:hotjar' );
const tracksDebug = debug( 'calypso:analytics:tracks' );
const statsdDebug = debug( 'calypso:analytics:statsd' );

let _superProps, _user, _selectedSite, _siteCount, _dispatch, _loadTracksError;

/**
 * Tracks uses a bunch of special query params that should not be used as property name
 * See internal Nosara repo?
 */
const TRACKS_SPECIAL_PROPS_NAMES = [ 'geo', 'message', 'request', 'geocity', 'ip' ];
const EVENT_NAME_EXCEPTIONS = [
	'a8c_cookie_banner_ok',
	// WooCommerce Onboarding / Connection Flow.
	'wcadmin_storeprofiler_create_jetpack_account',
	'wcadmin_storeprofiler_connect_store',
	'wcadmin_storeprofiler_login_jetpack_account',
];

// Load tracking scripts
if ( typeof window !== 'undefined' ) {
	window._tkq = window._tkq || [];
}

function getUrlParameter( name ) {
	name = name.replace( /[[]/g, '\\[' ).replace( /[\]]/g, '\\]' );
	const regex = new RegExp( '[\\?&]' + name + '=([^&#]*)' );
	const results = regex.exec( location.search );
	return results === null ? '' : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ) );
}

function createRandomId( randomBytesLength = 9 ) {
	// 9 * 4/3 = 12
	// this is to avoid getting padding of a random byte string when it is base64 encoded
	let randomBytes;

	if ( window.crypto && window.crypto.getRandomValues ) {
		randomBytes = new Uint8Array( randomBytesLength );
		window.crypto.getRandomValues( randomBytes );
	} else {
		randomBytes = times( randomBytesLength, () => Math.floor( Math.random() * 256 ) );
	}

	return btoa( String.fromCharCode.apply( String, randomBytes ) );
}

function checkForBlockedTracks() {
	if ( ! _loadTracksError ) {
		return;
	}

	let _ut, _ui;

	// detect stats blocking, and include identity from URL, user or cookie if possible
	if ( _user && _user.get() ) {
		_ut = 'wpcom:user_id';
		_ui = _user.get().ID;
	} else {
		_ut = getUrlParameter( '_ut' ) || 'anon';
		_ui = getUrlParameter( '_ui' );

		if ( ! _ui ) {
			const cookies = cookie.parse( document.cookie );
			if ( cookies.tk_ai ) {
				_ui = cookies.tk_ai;
			} else {
				const randomIdLength = 18; // 18 * 4/3 = 24 (base64 encoded chars)
				_ui = createRandomId( randomIdLength );
				document.cookie = cookie.serialize( 'tk_ai', _ui );
			}
		}
	}

	loadScript(
		'/nostats.js?_ut=' + encodeURIComponent( _ut ) + '&_ui=' + encodeURIComponent( _ui )
	);
}

if ( typeof document !== 'undefined' ) {
	loadScript( '//stats.wp.com/w.js?60', function( error ) {
		if ( error ) {
			_loadTracksError = true;
		}
	} ); // W_JS_VER
}

function buildQuerystring( group, name ) {
	let uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( const key in group ) {
			uriComponent += '&x_' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
		}
	} else {
		uriComponent = '&x_' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
	}

	return uriComponent;
}

function buildQuerystringNoPrefix( group, name ) {
	let uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( const key in group ) {
			uriComponent += '&' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
		}
	} else {
		uriComponent = '&' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
	}

	return uriComponent;
}

// we use this variable to track URL paths submitted to analytics.pageView.record
// so that analytics.pageLoading.record can re-use the urlPath parameter.
// this helps avoid some nasty coupling, but it's not the cleanest code - sorry.
let mostRecentUrlPath = null;

// pathCounter is used to keep track of the order of calypso_page_view Tracks
// events. The pathCounter value is appended to the last_pageview_path_with_count and
// this_pageview_path_with_count Tracks event props.
let pathCounter = 0;

if ( typeof window !== 'undefined' ) {
	window.addEventListener( 'popstate', function() {
		// throw away our URL value if the user used the back/forward buttons
		mostRecentUrlPath = null;
	} );
}

const analytics = {
	initialize: function( user, superProps ) {
		analytics.setUser( user );
		analytics.setSuperProps( superProps );
		const userData = user.get();
		analytics.identifyUser( userData.username, userData.ID );
	},

	setUser: function( user ) {
		_user = user;
	},

	setSuperProps: function( superProps ) {
		// this is called both for anonymous and logged-in users
		checkForBlockedTracks();
		_superProps = superProps;
	},

	setSelectedSite: function( selectedSite ) {
		_selectedSite = selectedSite;
	},

	setSiteCount: function( siteCount ) {
		_siteCount = siteCount;
	},

	setDispatch: function( dispatch ) {
		_dispatch = dispatch;
	},

	mc: {
		bumpStat: function( group, name ) {
			if ( 'object' === typeof group ) {
				mcDebug( 'Bumping stats %o', group );
			} else {
				mcDebug( 'Bumping stat %s:%s', group, name );
			}

			if ( config( 'mc_analytics_enabled' ) ) {
				const uriComponent = buildQuerystring( group, name );
				new Image().src =
					document.location.protocol +
					'//pixel.wp.com/g.gif?v=wpcom-no-pv' +
					uriComponent +
					'&t=' +
					Math.random();
			}
		},

		bumpStatWithPageView: function( group, name ) {
			// this function is fairly dangerous, as it bumps page views for wpcom and should only be called in very specific cases.
			if ( 'object' === typeof group ) {
				mcDebug( 'Bumping page view with props %o', group );
			} else {
				mcDebug( 'Bumping page view %s:%s', group, name );
			}

			if ( config( 'mc_analytics_enabled' ) ) {
				const uriComponent = buildQuerystringNoPrefix( group, name );
				new Image().src =
					document.location.protocol +
					'//pixel.wp.com/g.gif?v=wpcom' +
					uriComponent +
					'&t=' +
					Math.random();
			}
		},
	},

	// pageView is a wrapper for pageview events across Tracks and GA.
	pageView: {
		record: function( urlPath, pageTitle, params = {} ) {
			// Add delay to avoid stale `_dl` in recorded calypso_page_view event details.
			// `_dl` (browserdocumentlocation) is read from the current URL by external JavaScript.
			setTimeout( () => {
				// Add paths to parameters.
				params.last_pageview_path_with_count =
					mostRecentUrlPath + '(' + pathCounter.toString() + ')';
				params.this_pageview_path_with_count = urlPath + '(' + ( pathCounter + 1 ).toString() + ')';

				pvDebug( 'Recording pageview.', urlPath, pageTitle, params );

				// Tracks, Google Analytics, Refer platform.
				analytics.tracks.recordPageView( urlPath, params );
				analytics.ga.recordPageView( urlPath, pageTitle );
				analytics.refer.recordPageView();

				// Retargeting.
				saveCouponQueryArgument();
				updateQueryParamsTracking();
				retargetAdTrackers( urlPath );

				// Event emitter.
				analytics.emit( 'page-view', urlPath, pageTitle );

				// Record this path.
				mostRecentUrlPath = urlPath;
				pathCounter++;

				// Process queue.
				analytics.queue.process();
			}, 0 );
		},
	},

	// This is `localStorage` queue for delayed event triggers.
	queue: {
		lsKey: function() {
			return 'analyticsQueue';
		},

		clear: function() {
			if ( ! window.localStorage ) {
				return; // Not possible.
			}

			window.localStorage.removeItem( analytics.queue.lsKey() );
		},

		get: function() {
			if ( ! window.localStorage ) {
				return []; // Not possible.
			}

			let items = window.localStorage.getItem( analytics.queue.lsKey() );

			items = items ? JSON.parse( items ) : [];
			items = Array.isArray( items ) ? items : [];

			return items;
		},

		add: function( trigger, ...args ) {
			if ( ! window.localStorage ) {
				// If unable to queue, trigger it now.
				if ( 'string' === typeof trigger && 'function' === typeof analytics[ trigger ] ) {
					analytics[ trigger ].apply( null, args || undefined );
				}
				return; // Not possible.
			}

			let items = analytics.queue.get();
			const newItem = { trigger, args };

			items.push( newItem );
			items = items.slice( -100 ); // Upper limit.

			queueDebug( 'Adding new item to queue.', newItem );
			window.localStorage.setItem( analytics.queue.lsKey(), JSON.stringify( items ) );
		},

		process: function() {
			if ( ! window.localStorage ) {
				return; // Not possible.
			}

			const items = analytics.queue.get();
			analytics.queue.clear();

			queueDebug( 'Processing items in queue.', items );

			items.forEach( item => {
				if (
					'object' === typeof item &&
					'string' === typeof item.trigger &&
					'function' === typeof analytics[ item.trigger ]
				) {
					queueDebug( 'Processing item in queue.', item );
					analytics[ item.trigger ].apply( null, item.args || undefined );
				}
			} );
		},
	},

	recordSignupStart: function( { flow, ref } ) {
		// Tracks
		analytics.tracks.recordEvent( 'calypso_signup_start', { flow, ref } );
		// Google Analytics
		analytics.ga.recordEvent( 'Signup', 'calypso_signup_start' );
		// Marketing
		recordSignupStartInFloodlight();
	},

	recordRegistration: function( { flow } ) {
		// Tracks
		analytics.tracks.recordEvent( 'calypso_user_registration_complete', { flow } );
		// Google Analytics
		analytics.ga.recordEvent( 'Signup', 'calypso_user_registration_complete' );
		// Marketing
		recordRegistration();
	},

	recordSocialRegistration: function() {
		// Tracks
		analytics.tracks.recordEvent( 'calypso_user_registration_social_complete' );
		// Google Analytics
		analytics.ga.recordEvent( 'Signup', 'calypso_user_registration_social_complete' );
		// Marketing
		recordRegistration();
	},

	recordSignupComplete: function(
		{ isNewUser, isNewSite, hasCartItems, flow, isNew7DUserSite },
		now
	) {
		if ( ! now ) {
			// Delay using the analytics localStorage queue.
			return analytics.queue.add(
				'recordSignupComplete',
				{ isNewUser, isNewSite, hasCartItems, flow, isNew7DUserSite },
				true
			);
		}

		// Tracks
		analytics.tracks.recordEvent( 'calypso_signup_complete', {
			flow: flow,
			is_new_user: isNewUser,
			is_new_site: isNewSite,
			has_cart_items: hasCartItems,
		} );

		// Google Analytics
		const flags = [
			isNewUser && 'is_new_user',
			isNewSite && 'is_new_site',
			hasCartItems && 'has_cart_items',
		].filter( flag => false !== flag );

		analytics.ga.recordEvent( 'Signup', 'calypso_signup_complete:' + flags.join( ',' ) );

		if ( isNew7DUserSite ) {
			// Tracks
			analytics.tracks.recordEvent( 'calypso_new_user_site_creation', {
				flow: flow,
			} );

			// Google Analytics
			analytics.ga.recordEvent( 'Signup', 'calypso_new_user_site_creation' );
		}

		// Ad Tracking: Deprecated Floodlight pixels.
		recordSignupCompletionInFloodlight(); // Every signup.

		// Ad Tracking: New user, site creations.
		if ( isNewUser && isNewSite ) {
			recordSignup( 'new-user-site' );
		}
	},

	recordAddToCart: function( { cartItem } ) {
		// TODO: move Tracks event here?
		// Google Analytics
		const usdValue = costToUSD( cartItem.cost, cartItem.currency );
		analytics.ga.recordEvent(
			'Checkout',
			'calypso_cart_product_add',
			'',
			usdValue ? usdValue : undefined
		);
		// Marketing
		recordAddToCart( cartItem );
	},

	recordPurchase: function( { cart, orderId } ) {
		if ( cart.total_cost >= 0.01 ) {
			// Google Analytics
			const usdValue = costToUSD( cart.total_cost, cart.currency );
			analytics.ga.recordEvent(
				'Purchase',
				'calypso_checkout_payment_success',
				'',
				usdValue ? usdValue : undefined
			);
			// Marketing
			recordOrder( cart, orderId );
		}
	},

	timing: {
		record: function( eventType, duration, triggerName ) {
			const urlPath = mostRecentUrlPath || 'unknown';
			analytics.ga.recordTiming( urlPath, eventType, duration, triggerName );
			analytics.statsd.recordTiming( urlPath, eventType, duration, triggerName );
		},
	},

	tracks: {
		recordEvent: function( eventName, eventProperties ) {
			let superProperties;

			eventProperties = eventProperties || {};

			if ( process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' ) {
				if (
					! /^calypso(?:_[a-z]+){2,}$/.test( eventName ) &&
					! includes( EVENT_NAME_EXCEPTIONS, eventName )
				) {
					//eslint-disable-next-line no-console
					console.error(
						'Tracks: Event `%s` will be ignored because it does not match /^calypso(?:_[a-z]+){2,}$/ and is ' +
							'not a listed exception. Please use a compliant event name.',
						eventName
					);
				}

				for ( const key in eventProperties ) {
					if ( isObjectLike( eventProperties[ key ] ) ) {
						const errorMessage =
							`Tracks: Unable to record event "${ eventName }" because nested ` +
							`properties are not supported by Tracks. Check '${ key }' on`;
						console.error( errorMessage, eventProperties ); //eslint-disable-line no-console
						return;
					}

					if ( ! /^[a-z_][a-z0-9_]*$/.test( key ) ) {
						//eslint-disable-next-line no-console
						console.error(
							'Tracks: Event `%s` will be rejected because property name `%s` does not match /^[a-z_][a-z0-9_]*$/. ' +
								'Please use a compliant property name.',
							eventName,
							key
						);
					}

					if ( TRACKS_SPECIAL_PROPS_NAMES.indexOf( key ) !== -1 ) {
						//eslint-disable-next-line no-console
						console.error(
							"Tracks: Event property `%s` will be overwritten because it uses one of Tracks' internal prop name: %s. " +
								'Please use another property name.',
							key,
							TRACKS_SPECIAL_PROPS_NAMES.join( ', ' )
						);
					}
				}
			}

			tracksDebug( 'Record event "%s" called with props %o', eventName, eventProperties );

			if (
				eventName.indexOf( 'calypso_' ) !== 0 &&
				! includes( EVENT_NAME_EXCEPTIONS, eventName )
			) {
				tracksDebug(
					'- Event name must be prefixed by "calypso_" or added to `EVENT_NAME_EXCEPTIONS`'
				);
				return;
			}

			if ( _superProps ) {
				_dispatch && _dispatch( { type: ANALYTICS_SUPER_PROPS_UPDATE } );
				const site = shouldReportOmitBlogId( eventProperties.path ) ? null : _selectedSite;
				superProperties = _superProps.getAll( site, _siteCount );
				eventProperties = assign( {}, eventProperties, superProperties ); // assign to a new object so we don't modify the argument
			}

			// Remove properties that have an undefined value
			// This allows a caller to easily remove properties from the recorded set by setting them to undefined
			eventProperties = omit( eventProperties, isUndefined );

			tracksDebug( 'Recording event "%s" with actual props %o', eventName, eventProperties );

			if ( 'undefined' !== typeof window ) {
				window._tkq.push( [ 'recordEvent', eventName, eventProperties ] );
			}
			analytics.emit( 'record-event', eventName, eventProperties );
		},

		recordPageView: function( urlPath, params ) {
			let eventProperties = {
				build_timestamp: window.BUILD_TIMESTAMP,
				do_not_track: doNotTrack() ? 1 : 0,
				path: urlPath,
			};

			// add optional path params
			if ( params ) {
				eventProperties = assign( eventProperties, params );
			}

			// Record all `utm` marketing parameters as event properties on the page view event
			// so we can analyze their performance with our analytics tools
			if ( window.location ) {
				const parsedUrl = url.parse( window.location.href );
				const urlParams = parse( parsedUrl.query );
				const utmParams = pickBy( urlParams, ( value, key ) => key.startsWith( 'utm_' ) );

				eventProperties = assign( eventProperties, utmParams );
			}

			analytics.tracks.recordEvent( 'calypso_page_view', eventProperties );
		},

		createRandomId,

		/**
		 * Returns the anoymous id stored in the `tk_ai` cookie
		 *
		 * @returns {String} - The Tracks anonymous user id
		 */
		anonymousUserId: function() {
			const cookies = cookie.parse( document.cookie );

			return cookies.tk_ai;
		},

		setOptOut: function( isOptingOut ) {
			window._tkq.push( [ 'setOptOut', isOptingOut ] );
		},
	},

	statsd: {
		/* eslint-enable no-unused-vars */
		recordTiming: function( pageUrl, eventType, duration /* triggerName */ ) {
			// ignore triggerName for now, it has no obvious place in statsd
			/* eslint-disable no-unused-vars */

			if ( config( 'boom_analytics_enabled' ) ) {
				const featureSlug = getFeatureSlugFromPageUrl( pageUrl );

				statsdDebug(
					`Recording timing: path=${ featureSlug } event=${ eventType } duration=${ duration }ms`
				);

				const imgUrl = statsdTimingUrl( featureSlug, eventType, duration );
				new Image().src = imgUrl;
			}
		},

		recordCounting: function( pageUrl, eventType, increment = 1 ) {
			if ( config( 'boom_analytics_enabled' ) ) {
				const featureSlug = getFeatureSlugFromPageUrl( pageUrl );

				statsdDebug(
					`Recording counting: path=${ featureSlug } event=${ eventType } increment=${ increment }`
				);

				const imgUrl = statsdCountingUrl( featureSlug, eventType, increment );
				new Image().src = imgUrl;
			}
		},
	},

	// Google Analytics usage and event stat tracking
	ga: {
		initialized: false,

		initialize: function() {
			if ( ! analytics.ga.initialized ) {
				const parameters = {
					send_page_view: false,
					...getGoogleAnalyticsDefaultConfig(),
				};

				gaDebug( 'parameters:', parameters );

				setupGoogleAnalyticsGtag( parameters );

				analytics.ga.initialized = true;
			}
		},

		recordPageView: makeGoogleAnalyticsTrackingFunction( function recordPageView(
			urlPath,
			pageTitle
		) {
			gaDebug( 'Recording Page View ~ [URL: ' + urlPath + '] [Title: ' + pageTitle + ']' );

			fireGoogleAnalyticsPageView( urlPath, pageTitle );
		} ),

		/**
		 * Fires a generic Google Analytics event
		 *
		 * {String} category Is the string that will appear as the event category.
		 * {String} action Is the string that will appear as the event action in Google Analytics Event reports.
		 * {String} label Is the string that will appear as the event label.
		 * {String} value Is a non-negative integer that will appear as the event value.
		 */
		recordEvent: makeGoogleAnalyticsTrackingFunction( function recordEvent(
			category,
			action,
			label,
			value
		) {
			if ( 'undefined' !== typeof value && ! isNaN( Number( String( value ) ) ) ) {
				value = Math.round( Number( String( value ) ) ); // GA requires an integer value.
				// https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventValue
			}

			let debugText = 'Recording Event ~ [Category: ' + category + '] [Action: ' + action + ']';

			if ( 'undefined' !== typeof label ) {
				debugText += ' [Option Label: ' + label + ']';
			}

			if ( 'undefined' !== typeof value ) {
				debugText += ' [Option Value: ' + value + ']';
			}

			gaDebug( debugText );

			fireGoogleAnalyticsEvent( category, action, label, value );
		} ),

		recordTiming: makeGoogleAnalyticsTrackingFunction( function recordTiming(
			urlPath,
			eventType,
			duration,
			triggerName
		) {
			gaDebug( 'Recording Timing ~ [URL: ' + urlPath + '] [Duration: ' + duration + ']' );

			fireGoogleAnalyticsTiming( eventType, duration, urlPath, triggerName );
		} ),
	},

	// Refer platform tracking.
	refer: {
		recordPageView: function() {
			if ( ! window || ! window.location ) {
				return; // Not possible.
			}

			const referrer = window.location.href;
			const parsedUrl = urlParseAmpCompatible( referrer );
			const affiliateId = parsedUrl.query.aff || parsedUrl.query.affiliate;
			const campaignId = parsedUrl.query.cid;
			const subId = parsedUrl.query.sid;

			if ( affiliateId && ! isNaN( affiliateId ) ) {
				analytics.tracks.recordEvent( 'calypso_refer_visit', {
					page: parsedUrl.host + parsedUrl.pathname,
				} );

				referDebug( 'Recording affiliate referral.', { affiliateId, campaignId, subId, referrer } );
				reduxDispatch( trackAffiliateReferral( { affiliateId, campaignId, subId, referrer } ) );
			}
		},
	},

	// HotJar tracking
	hotjar: {
		addHotJarScript: function() {
			if (
				! config( 'hotjar_enabled' ) ||
				isE2ETest() ||
				doNotTrack() ||
				isPiiUrl() ||
				! mayWeTrackCurrentUserGdpr()
			) {
				hotjarDebug( 'Not loading HotJar script' );
				return;
			}

			( function( h, o, t, j, a, r ) {
				hotjarDebug( 'Loading HotJar script' );
				h.hj =
					h.hj ||
					function() {
						( h.hj.q = h.hj.q || [] ).push( arguments );
					};
				h._hjSettings = { hjid: 227769, hjsv: 5 };
				a = o.getElementsByTagName( 'head' )[ 0 ];
				r = o.createElement( 'script' );
				r.async = 1;
				r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
				a.appendChild( r );
			} )( window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=' );
		},
	},

	identifyUser: function( newUserName, newUserId ) {
		const anonymousUserId = this.tracks.anonymousUserId();

		// Don't identify the user if we don't have one
		if ( newUserId && newUserName ) {
			if ( anonymousUserId ) {
				recordAliasInFloodlight();
			}
			window._tkq.push( [ 'identifyUser', newUserId, newUserName ] );
		}
	},

	setProperties: function( properties ) {
		window._tkq.push( [ 'setProperties', properties ] );
	},

	clearedIdentity: function() {
		window._tkq.push( [ 'clearIdentity' ] );
	},
};

/**
 * Wrap Google Analytics with debugging, possible analytics supression, and initialization
 *
 * This method will display debug output if Google Analytics is suppresed, otherwise it will
 * initialize and call the Google Analytics function it is passed.
 *
 * @see isGoogleAnalyticsAllowed
 *
 * @param  {Function} func Google Analytics tracking function
 * @return {Function}      Wrapped function
 */
export function makeGoogleAnalyticsTrackingFunction( func ) {
	return function( ...args ) {
		if ( ! isGoogleAnalyticsAllowed() ) {
			gaDebug( '[Disallowed] analytics %s( %o )', func.name, args );
			return;
		}

		analytics.ga.initialize();

		func( ...args );
	};
}

emitter( analytics );

export default analytics;
export const ga = analytics.ga;
export const mc = analytics.mc;
export const queue = analytics.queue;
export const tracks = analytics.tracks;
export const pageView = analytics.pageView;
