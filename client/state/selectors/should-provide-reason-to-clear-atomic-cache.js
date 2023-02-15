import 'calypso/state/hosting/init';

const ONE_DAY_IN_MILLISECONDS = 86400 * 1000;

export function shouldProvideReasonToClearAtomicCache( state, siteId ) {
	const lastCacheCleared = state.atomicHosting?.[ siteId ]?.lastCacheClearTimestamp;

	if ( ! lastCacheCleared ) {
		return true;
	}

	const oneDayAgo = new Date().valueOf() - ONE_DAY_IN_MILLISECONDS;
	const wasCleanedMoreThanOneDayAgo = oneDayAgo > lastCacheCleared;

	return wasCleanedMoreThanOneDayAgo;
}
