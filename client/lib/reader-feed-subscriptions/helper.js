var untrailingslashit = require( 'lib/route/untrailingslashit' );

module.exports = {
	// Prepare site URL for use with the FeedSubscriptionStore
	prepareSiteUrl: function( url ) {
		// Convert https:// to http://, remove trailing /
		var preparedUrl = url && untrailingslashit( url.replace( 'https://', 'http://' ) );
		return preparedUrl;
	}
};
