var inflight = require( 'lib/inflight' ),
	wpcom = require( 'lib/wp' );

function requestKey( feedId ) {
	return `feed-${feedId}`;
}

const FeedUrlStoreActions = {
	discover: function( feedUrl, fn ) {
		const key = requestKey( feedUrl );

		if ( inflight.requestInflight( key ) ) {
			return;
		}

		return wpcom.undocumented().discoverFeed(
			{ url: feedUrl },
			fn
		);
	},

};

module.exports = FeedUrlStoreActions;
