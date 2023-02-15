import 'calypso/state/hosting/init';

const FIVE_MINUTES_IN_MILLISECONDS = 300 * 1000;

export function shouldRateLimitAtomicCacheClear( state, siteId ) {
	const lastCacheCleared = state.atomicHosting?.[ siteId ]?.lastCacheClearTimestamp;

	if ( ! lastCacheCleared ) {
		return false;
	}

	const rateLimitTime = new Date().valueOf() - FIVE_MINUTES_IN_MILLISECONDS;
	return lastCacheCleared > rateLimitTime;
}
