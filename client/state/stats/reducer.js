import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import chartTabs from './chart-tabs/reducer';
import lists from './lists/reducer';
import posts from './posts/reducer';
import recentPostViews from './recent-post-views/reducer';

const combinedReducer = combineReducers( {
	chartTabs,
	posts,
	lists,
	recentPostViews,
} );
const statsReducer = withStorageKey( 'stats', combinedReducer );

export default statsReducer;
