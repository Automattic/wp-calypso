import { useEffect } from 'react';

export interface UseLoadMoreOptions {
	/** Index of the last item the virtualizer has rendered, or `undefined` before first render. */
	lastIndex: number | undefined;
	/** Total number of items the virtualizer is counting. */
	count: number;
	hasMore: boolean;
	/** True while a next page is already in flight — gates `loadMore`. */
	isLoadingMore: boolean;
	loadMore: () => void;
}

/**
 * Fire `loadMore` once the virtualizer has rendered up to (or past) the last
 * item, while more remain and none is already loading. The `isLoadingMore`
 * guard is essential: without it the effect re-runs on every measurement render
 * near the end and spams `loadMore`, cascading page loads and freezing the UI.
 */
export function useLoadMore( {
	lastIndex,
	count,
	hasMore,
	isLoadingMore,
	loadMore,
}: UseLoadMoreOptions ): void {
	useEffect( () => {
		if ( hasMore && ! isLoadingMore && lastIndex !== undefined && lastIndex >= count - 1 ) {
			loadMore();
		}
	}, [ lastIndex, count, hasMore, isLoadingMore, loadMore ] );
}
