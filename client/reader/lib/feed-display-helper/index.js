import { getSiteUrl, getFeedUrl } from 'reader/route';

module.exports = {
	formatUrlForDisplay: function( url ) {
		if ( ! url ) {
			return;
		}

		return url.replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
	},

	// Use either the site name, feed name or display URL for the feed name
	getFeedTitle: function( siteData, feedData, displayUrl ) {
		var feedTitle;

		if ( siteData && siteData.get( 'name' ) ) {
			feedTitle = siteData.get( 'name' );
		} else if ( feedData && feedData.name ) {
			feedTitle = feedData.name;
		} else {
			feedTitle = displayUrl;
		}

		return feedTitle;
	},

	getFeedStreamUrl: function( siteData, feedData ) {
		if ( ! siteData && ! feedData ) {
			return null;
		}

		if ( feedData ) {
			return getFeedUrl( feedData.feed_ID );
		}

		return getSiteUrl( siteData.get( 'ID' ) );
	},

	getSiteUrl: function( siteData, feedData, subscription ) {
		var siteUrl;

		if ( siteData && siteData.get( 'URL' ) ) {
			siteUrl = siteData.get( 'URL' );
		} else if ( feedData && feedData.URL ) {
			siteUrl = feedData.URL;
		} else if ( subscription && subscription.get( 'URL' ) ) {
			siteUrl = subscription.get( 'URL' );
		}

		return siteUrl;
	}
};
