/**
 * Internal dependencies
 */
import cache from './cache/reducer';
import { combineReducers } from 'state/utils';
import notices from './notices/reducer';
import settings from './settings/reducer';
import stats from './stats/reducer';

export default combineReducers( {
	cache,
	notices,
	settings,
	stats,
} );
