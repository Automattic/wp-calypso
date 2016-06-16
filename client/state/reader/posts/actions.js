/**
 * External Dependencies
 */
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import isUndefined from 'lodash/isUndefined';
import reject from 'lodash/reject';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';
import analytics from 'lib/analytics';
import { runFastRules, runSlowRules } from './normalization-rules';
import Dispatcher from 'dispatcher';
import { action } from 'lib/feed-post-store/constants';

function trackRailcarRender( post ) {
	analytics.tracks.recordEvent( 'calypso_traintracks_render', post.railcar );
}

/**
 * Returns an action object to signal that post objects have been received.
 *
 * @param  {Array}  posts Posts received
 * @return {Object} Action object
 */
export function receivePosts( posts ) {
	if ( ! posts ) {
		return Promise.resolve( [] );
	}
	return function( dispatch ) {
		const withoutUndefined = reject( posts, isUndefined );
		const normalizedPosts = map( withoutUndefined, runFastRules );

		forEach( map( normalizedPosts, runSlowRules ), slowPromise => {
			slowPromise.then( post => {
				dispatch( {
					type: READER_POSTS_RECEIVE,
					posts: [ post ]
				} );

				// keep the old feed post store in sync
				Dispatcher.handleServerAction( {
					data: post,
					type: action.RECEIVE_NORMALIZED_FEED_POST
				} );
			} );
		} );

		dispatch( {
			type: READER_POSTS_RECEIVE,
			posts: normalizedPosts
		} );

		// keep the old feed post store in sync
		forEach( normalizedPosts, post => {
			Dispatcher.handleServerAction( {
				data: post,
				type: action.RECEIVE_NORMALIZED_FEED_POST
			} );
		} );

		forEach( filter( normalizedPosts, 'railcar' ), trackRailcarRender );

		return Promise.resolve( normalizedPosts );
	};
}
