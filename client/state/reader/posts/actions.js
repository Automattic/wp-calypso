/**
 * External Dependencies
 */
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

import { runFastRules, runSlowRules } from './normalization-rules';

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
			} );
		} );

		dispatch( {
			type: READER_POSTS_RECEIVE,
			posts: normalizedPosts
		} );

		return Promise.resolve( normalizedPosts );
	};
}
