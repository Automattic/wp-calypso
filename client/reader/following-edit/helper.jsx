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

		if ( siteData ) {
			return '/read/blog/id/' + siteData.get( 'ID' );
		}

		return '/read/blog/feed/' + feedData.feed_ID;
	}
};
