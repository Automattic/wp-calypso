import type { ReadStreamPost } from '@automattic/api-core';

/**
 * The contract every space-feed layout implements. The shell owns the data and
 * the scroll element; each layout owns its own `useVirtualizer` so it can pick
 * the geometry that fits — vertical list, grid, masonry. A layout calls
 * `loadMore()` when its last virtual row nears the end and `hasMore` is true.
 *
 * `scrollElement` is passed as state (not a ref) so the virtualizer re-evaluates
 * once the container mounts — on Back the layout and container mount in the same
 * commit, and a ref would still read `null` during the virtualizer's setup.
 */
export interface SpaceFeedLayoutProps {
	posts: ReadStreamPost[];
	/**
	 * The stream the feed reads from. Only the legacy layout (which fetches its
	 * own data via ReaderStreamV2) needs it; the others read `posts` from the shell.
	 */
	streamKey: string;
	scrollElement: HTMLElement | null;
	hasMore: boolean;
	/** True while a next page is already in flight — gates `loadMore`. */
	isLoadingMore: boolean;
	loadMore: () => void;
	/** Stable key (`${spaceId}:${layout}`) for saving/restoring scroll on Back. */
	restoreKey: string;
}
