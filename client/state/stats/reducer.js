import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import chartTabs from './chart-tabs/reducer';
import emails from './emails/reducer';
import highlights from './highlights/reducer';
import lists from './lists/reducer';
import moduleSettings from './module-settings/reducer';
import moduleToggles from './module-toggles/reducer';
import notices from './notices/reducer';
import paidStatsUpsell from './paid-stats-upsell/reducer';
import planUsage from './plan-usage/reducer';
import posts from './posts/reducer';
import recentPostViews from './recent-post-views/reducer';
import utmMetrics from './utm-metrics/reducer';

const combinedReducer = combineReducers( {
	chartTabs,
	highlights,
	moduleSettings,
	moduleToggles,
	lists,
	posts,
	emails,
	recentPostViews,
	paidStatsUpsell,
	notices,
	utmMetrics,
	planUsage,
} );
const statsReducer = withStorageKey( 'stats', combinedReducer );

export default statsReducer;
