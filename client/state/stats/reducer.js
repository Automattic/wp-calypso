/**
 * Internal dependencies
 */
import posts from './posts/reducer';
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import lists from './lists/reducer';
import recentPostViews from './recent-post-views/reducer';
import chartTabs from './chart-tabs/reducer';

const combinedReducer = combineReducers( {
	chartTabs,
	posts,
	lists,
	recentPostViews,
} );
const statsReducer = withStorageKey( 'stats', combinedReducer );

export default statsReducer;
