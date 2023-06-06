import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import chartTabs from './chart-tabs/reducer';
import emails from './emails/reducer';
import highlights from './highlights/reducer';
import lists from './lists/reducer';
import moduleSettings from './module-settings/reducer';
import moduleToggles from './module-toggles/reducer';
import posts from './posts/reducer';
import recentPostViews from './recent-post-views/reducer';

const combinedReducer = combineReducers( {
	chartTabs,
	highlights,
	moduleSettings,
	moduleToggles,
	lists,
	posts,
	emails,
	recentPostViews,
} );
const statsReducer = withStorageKey( 'stats', combinedReducer );

export default statsReducer;
