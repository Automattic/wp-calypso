/** @format */

/**
 * Internal dependencies
 */

import cache from './cache/reducer';
import { combineReducers } from 'state/utils';
import plugins from './plugins/reducer';
import status from './status/reducer';
import settings from './settings/reducer';
import stats from './stats/reducer';

export default combineReducers( {
	cache,
	plugins,
	status,
	settings,
	stats,
} );
