import 'calypso/state/hosting/init';

const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;

export function shouldRateLimitAtomicCacheClear( state, siteId ) {
	const lastCacheCleared = state.atomicHosting?.[ siteId ]?.lastCacheClearTimestamp;

	if ( ! lastCacheCleared ) {
		return false;
	}

	const rateLimitTime = Date.now() - ONE_MINUTE_IN_MILLISECONDS;
	return lastCacheCleared > rateLimitTime;
}
