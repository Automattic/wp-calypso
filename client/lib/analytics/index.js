/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import emitter from 'lib/mixins/emitter';
import { costToUSD, urlParseAmpCompatible, saveCouponQueryArgument } from 'lib/analytics/utils';

import {
	getGoogleAnalyticsDefaultConfig,
	retarget as retargetAdTrackers,
	recordAliasInFloodlight,
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
import { trackAffiliateReferral } from './refer';
import { getFeatureSlugFromPageUrl } from './feature-slug';
import { recordSignupComplete } from './signup';
import {
	recordTracksEvent,
	analyticsEvents,
	initializeAnalytics,
	identifyUser,
	getTracksAnonymousUserId,
	recordTracksPageView,
	getCurrentUser,
} from '@automattic/calypso-analytics';

/**
 * Module variables
 */
const identifyUserDebug = debug( 'calypso:analytics:identifyUser' );
const pageViewDebug = debug( 'calypso:analytics:pageview' );
const mcDebug = debug( 'calypso:analytics:mc' );
const gaDebug = debug( 'calypso:analytics:ga' );
const queueDebug = debug( 'calypso:analytics:queue' );
const statsdDebug = debug( 'calypso:analytics:statsd' );

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
	initialize: function( currentUser, superProps ) {
		return initializeAnalytics( currentUser, superProps ).then( () => {
			const user = getCurrentUser();

			// This block is neccessary because calypso-analytics/initializeAnalytics no longer calls out to ad-tracking
			if ( 'object' === typeof currentUser && user && getTracksAnonymousUserId() ) {
				identifyUserDebug( 'recordAliasInFloodlight', user );
				recordAliasInFloodlight();
			}
		} );
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
				new window.Image().src =
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
				new window.Image().src =
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

				pageViewDebug( 'Recording pageview.', urlPath, pageTitle, params );

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

	// `analytics.recordSignupComplete` needs to be present for `analytics.queue` to call
	// the method after page navigation.
	recordSignupComplete,

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
			analyticsEvents.once( 'record-event', ( _eventName, _eventProperties ) => {
				analytics.emit( 'record-event', _eventName, _eventProperties );
			} );

			recordTracksEvent( eventName, eventProperties );
		},

		recordPageView: function( urlPath, params ) {
			recordTracksPageView( urlPath, params );
		},

		setOptOut: function( isOptingOut ) {
			window._tkq.push( [ 'setOptOut', isOptingOut ] );
		},
	},

	statsd: {
		recordTiming: function( pageUrl, eventType, duration ) {
			if ( config( 'boom_analytics_enabled' ) ) {
				const featureSlug = getFeatureSlugFromPageUrl( pageUrl );

				statsdDebug(
					`Recording timing: path=${ featureSlug } event=${ eventType } duration=${ duration }ms`
				);

				const imgUrl = statsdTimingUrl( featureSlug, eventType, duration );
				new window.Image().src = imgUrl;
			}
		},

		recordCounting: function( pageUrl, eventType, increment = 1 ) {
			if ( config( 'boom_analytics_enabled' ) ) {
				const featureSlug = getFeatureSlugFromPageUrl( pageUrl );

				statsdDebug(
					`Recording counting: path=${ featureSlug } event=${ eventType } increment=${ increment }`
				);

				const imgUrl = statsdCountingUrl( featureSlug, eventType, increment );
				new window.Image().src = imgUrl;
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
		 * {string} category Is the string that will appear as the event category.
		 * {string} action Is the string that will appear as the event action in Google Analytics Event reports.
		 * {string} label Is the string that will appear as the event label.
		 * {string} value Is a non-negative integer that will appear as the event value.
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
			const affiliateId =
				parsedUrl?.searchParams.get( 'aff' ) || parsedUrl?.searchParams.get( 'affiliate' );
			const campaignId = parsedUrl?.searchParams.get( 'cid' );
			const subId = parsedUrl?.searchParams.get( 'sid' );

			if ( affiliateId && ! isNaN( affiliateId ) ) {
				analytics.tracks.recordEvent( 'calypso_refer_visit', {
					page: parsedUrl.host + parsedUrl.pathname,
				} );

				trackAffiliateReferral( { affiliateId, campaignId, subId, referrer } );
			}
		},
	},

	identifyUser: function( userData ) {
		identifyUser( userData );

		// neccessary because calypso-analytics/initializeAnalytics no longer calls out to ad-tracking
		const user = getCurrentUser();
		if ( 'object' === typeof userData && user && getTracksAnonymousUserId() ) {
			identifyUserDebug( 'recordAliasInFloodlight', user );
			recordAliasInFloodlight();
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
 * @returns {Function} Wrapped function
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
