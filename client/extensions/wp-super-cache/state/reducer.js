/**
 * Internal dependencies
 */
import cache from './cache/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import notices from './notices/reducer';
import settings from './settings/reducer';
import stats from './stats/reducer';

export default combineReducersWithPersistence( {
	cache,
	notices,
	settings,
	stats,
} );
