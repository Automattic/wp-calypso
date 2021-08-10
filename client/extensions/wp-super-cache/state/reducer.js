import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import cache from './cache/reducer';
import plugins from './plugins/reducer';
import settings from './settings/reducer';
import stats from './stats/reducer';
import status from './status/reducer';

export default withStorageKey(
	'wp-super-cache',
	combineReducers( {
		cache,
		plugins,
		status,
		settings,
		stats,
	} )
);
