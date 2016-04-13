var ActionType = require( './constants' ).action,
	Dispatcher = require( 'dispatcher' ),
	inflight = require( 'lib/inflight' ),
	wpcom = require( 'lib/wp' );

function requestKey( feedId ) {
	return `feed-${feedId}`;
}

const FeedStoreActions = {
	fetch: function( feedId ) {
		const key = requestKey( feedId );

		if ( inflight.requestInflight( key ) ) {
			return;
		}

		wpcom.undocumented().readFeed(
			{ ID: feedId, meta: 'site' },
			inflight.requestTracker( key, FeedStoreActions.receiveFeedFetch.bind( FeedStoreActions, feedId ) )
		);
	},

	receiveFeedFetch: function( feedId, error, data ) {
		Dispatcher.handleServerAction( {
			type: ActionType.RECEIVE_FETCH,
			feedId: feedId,
			error: error,
			data: data
		} );
	}
};

module.exports = FeedStoreActions;
