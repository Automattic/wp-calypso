/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Internal dependencies
 */
import emitter from 'lib/mixins/emitter';
import { costToUSD, urlParseAmpCompatible, saveCouponQueryArgument } from 'lib/analytics/utils';

import {
	retarget as retargetAdTrackers,
	recordAliasInFloodlight,
	recordAddToCart,
	recordOrder,
} from 'lib/analytics/ad-tracking';
import { updateQueryParamsTracking } from 'lib/analytics/sem';
import { trackAffiliateReferral } from './refer';
import { recordSignupComplete } from './signup';
import { gaRecordEvent, gaRecordPageView } from './ga';
import {
	recordTracksEvent,
	analyticsEvents,
	initializeAnalytics,
	identifyUser,
	getTracksAnonymousUserId,
	recordTracksPageView,
	getCurrentUser,
	recordTracksPageViewWithPageParams,
	pushEventToTracksQueue,
} from '@automattic/calypso-analytics';

/**
 * Module variables
 */
const identifyUserDebug = debug( 'calypso:analytics:identifyUser' );
const queueDebug = debug( 'calypso:analytics:queue' );

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

	// pageView is a wrapper for pageview events across Tracks and GA.
	pageView: {
		record: function( urlPath, pageTitle, params = {} ) {
			// Add delay to avoid stale `_dl` in recorded calypso_page_view event details.
			// `_dl` (browserdocumentlocation) is read from the current URL by external JavaScript.
			setTimeout( () => {
				// Tracks, Google Analytics, Refer platform.
				recordTracksPageViewWithPageParams( urlPath, params );
				gaRecordPageView( urlPath, pageTitle );
				analytics.refer.recordPageView();

				// Retargeting.
				saveCouponQueryArgument();
				updateQueryParamsTracking();
				retargetAdTrackers( urlPath );

				// Event emitter.
				analytics.emit( 'page-view', urlPath, pageTitle );

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
		gaRecordEvent( 'Checkout', 'calypso_cart_product_add', '', usdValue ? usdValue : undefined );
		// Marketing
		recordAddToCart( cartItem );
	},

	recordPurchase: function( { cart, orderId } ) {
		if ( cart.total_cost >= 0.01 ) {
			// Google Analytics
			const usdValue = costToUSD( cart.total_cost, cart.currency );
			gaRecordEvent(
				'Purchase',
				'calypso_checkout_payment_success',
				'',
				usdValue ? usdValue : undefined
			);
			// Marketing
			recordOrder( cart, orderId );
		}
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
			pushEventToTracksQueue( [ 'setOptOut', isOptingOut ] );
		},
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
		pushEventToTracksQueue( [ 'setProperties', properties ] );
	},

	clearedIdentity: function() {
		pushEventToTracksQueue( [ 'clearIdentity' ] );
	},
};

emitter( analytics );

export default analytics;
export const queue = analytics.queue;
export const tracks = analytics.tracks;
export const pageView = analytics.pageView;
