/** @format */

/**
 * Internal dependencies
 */

import posts from './posts/reducer';
import lists from './lists/reducer';
import topPosts from './top-posts/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	topPosts,
	posts,
	lists,
} );
