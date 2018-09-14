/** @format */

/**
 * Internal dependencies
 */

import posts from './posts/reducer';
import { combineReducers } from 'state/utils';
import lists from './lists/reducer';
import recentViews from './views/posts/reducer';

export default combineReducers( {
	posts,
	lists,
	recentViews,
} );
