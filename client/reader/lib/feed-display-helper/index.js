/**
 * Internal dependencies
 */
import { getSiteUrl as getSiteUrlFromRoute, getFeedUrl } from 'reader/route';
import { withoutHttp } from 'lib/url';

const exported = {
	formatUrlForDisplay: function ( url ) {
		if ( ! url ) {
			return;
		}

		return withoutHttp( url ).replace( /\/$/, '' );
	},

	// Use either the site name, feed name or display URL for the feed name
	getFeedTitle: function ( siteData, feedData, displayUrl ) {
		let feedTitle;

		if ( siteData && siteData.name ) {
			feedTitle = siteData.name;
		} else if ( feedData && feedData.name ) {
			feedTitle = feedData.name;
		} else {
			feedTitle = displayUrl;
		}

		return feedTitle;
	},

	getFeedStreamUrl: function ( siteData, feedData ) {
		if ( ! siteData && ! feedData ) {
			return null;
		}

		if ( feedData ) {
			return getFeedUrl( feedData.feed_ID );
		}

		return getSiteUrlFromRoute( siteData.get( 'ID' ) );
	},

	getSiteUrl: function ( siteData, feedData, subscription ) {
		let siteUrl;

		if ( siteData && siteData.URL ) {
			siteUrl = siteData.URL;
		} else if ( feedData && feedData.URL ) {
			siteUrl = feedData.URL;
		} else if ( subscription && subscription.URL ) {
			siteUrl = subscription.URL;
		}

		return siteUrl;
	},
};

export default exported;

export const { formatUrlForDisplay, getFeedTitle, getFeedStreamUrl, getSiteUrl } = exported;
