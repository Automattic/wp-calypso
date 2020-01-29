/**
 * Internal dependencies
 */

import posts from './posts/reducer';
import { combineReducers } from 'state/utils';
import lists from './lists/reducer';
import recentPostViews from './recent-post-views/reducer';
import chartTabs from './chart-tabs/reducer';

export default combineReducers( {
	chartTabs,
	posts,
	lists,
	recentPostViews,
} );
