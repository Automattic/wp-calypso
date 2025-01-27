import 'calypso/state/hosting/init';
import type { AppState } from 'calypso/types';

const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;

export function shouldRateLimitEdgeCacheClear( state: AppState, siteId: number | null ) {
	if ( ! siteId ) {
		return false;
	}

	const lastCacheCleared = state.atomicHosting?.[ siteId ]?.lastEdgeCacheClearTimestamp;

	if ( ! lastCacheCleared ) {
		return false;
	}

	const rateLimitTime = Date.now() - ONE_MINUTE_IN_MILLISECONDS;
	return lastCacheCleared > rateLimitTime;
}
