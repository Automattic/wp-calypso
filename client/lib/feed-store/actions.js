/**
 * External Dependencies
 */
import { action as ActionType } from './constants';
import Dispatcher from 'dispatcher';
import { isRequestInflight, requestTracker } from 'lib/inflight';
import wpcom from 'lib/wp';

function requestKey( feedId ) {
	return `feed-${ feedId }`;
}

const FeedStoreActions = {
	fetch: function( feedId ) {
		const key = requestKey( feedId );

		if ( isRequestInflight( key ) ) {
			return;
		}

		wpcom.undocumented().readFeed(
			{ ID: feedId, meta: 'site' },
			requestTracker( key, FeedStoreActions.receiveFeedFetch.bind( FeedStoreActions, feedId ) )
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
