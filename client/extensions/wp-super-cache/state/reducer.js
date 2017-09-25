/**
 * Internal dependencies
 */
import cache from './cache/reducer';
import settings from './settings/reducer';
import stats from './stats/reducer';
import status from './status/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	cache,
	status,
	settings,
	stats,
} );
