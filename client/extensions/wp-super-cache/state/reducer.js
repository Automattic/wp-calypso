/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import cache from './cache/reducer';
import { combineReducers } from 'calypso/state/utils';
import plugins from './plugins/reducer';
import status from './status/reducer';
import settings from './settings/reducer';
import stats from './stats/reducer';

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
