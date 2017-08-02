/**
 * Internal dependencies
 */
import cache from './cache/reducer';
import debug from './debug/reducer';
import { combineReducers } from 'state/utils';
import status from './status/reducer';
import settings from './settings/reducer';
import stats from './stats/reducer';

export default combineReducers( {
	cache,
	debug,
	status,
	settings,
	stats,
} );
