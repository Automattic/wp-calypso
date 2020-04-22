/**
 * Internal dependencies
 */
import emitter from 'lib/mixins/emitter';
import { urlParseAmpCompatible, saveCouponQueryArgument } from 'lib/analytics/utils';

import { retarget as retargetAdTrackers } from 'lib/analytics/ad-tracking';
import { updateQueryParamsTracking } from 'lib/analytics/sem';
import { trackAffiliateReferral } from './refer';
import { gaRecordPageView } from './ga';
import { processQueue } from './queue';
import {
	recordTracksEvent,
	analyticsEvents,
	recordTracksPageView,
	recordTracksPageViewWithPageParams,
	pushEventToTracksQueue,
} from '@automattic/calypso-analytics';

const analytics = {
	// pageView is a wrapper for pageview events across Tracks and GA.
	pageView: {
		record: function ( urlPath, pageTitle, params = {} ) {
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
				processQueue();
			}, 0 );
		},
	},

	tracks: {
		recordEvent: function ( eventName, eventProperties ) {
			analyticsEvents.once( 'record-event', ( _eventName, _eventProperties ) => {
				analytics.emit( 'record-event', _eventName, _eventProperties );
			} );

			recordTracksEvent( eventName, eventProperties );
		},

		recordPageView: function ( urlPath, params ) {
			recordTracksPageView( urlPath, params );
		},

		setOptOut: function ( isOptingOut ) {
			pushEventToTracksQueue( [ 'setOptOut', isOptingOut ] );
		},
	},

	// Refer platform tracking.
	refer: {
		recordPageView: function () {
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

	setProperties: function ( properties ) {
		pushEventToTracksQueue( [ 'setProperties', properties ] );
	},

	clearedIdentity: function () {
		pushEventToTracksQueue( [ 'clearIdentity' ] );
	},
};

emitter( analytics );

export default analytics;
export const tracks = analytics.tracks;
export const pageView = analytics.pageView;
