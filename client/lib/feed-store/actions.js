var ActionType = require( './constants' ).action,
	Dispatcher = require( 'dispatcher' ),
	FeedStore = require( './' ),
	FeedState = require( './constants' ).state,
	wpcom = require( 'lib/wp' );

var FeedStoreActions = {
	fetch: function( feedId ) {
		var feed = FeedStore.get( feedId );

		if ( feed && feed.state === FeedState.PENDING ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: ActionType.FETCH,
			feedId: feedId
		} );

		wpcom.undocumented().readFeed(
			{ ID: feedId, meta: 'site' },
			FeedStoreActions.receiveFeedFetch.bind( FeedStoreActions, feedId )
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
