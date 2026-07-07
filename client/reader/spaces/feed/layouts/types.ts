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
	/** Whether a post is the currently selected one. */
	isPostSelected: ( post: ReadStreamPost ) => boolean;
	/** Mark a post as selected. */
	selectPost: ( post: ReadStreamPost ) => void;
	/**
	 * Whether to show each post's published-time stamp. False for Discover, whose
	 * results are recommendation-ranked rather than chronological, so a "time ago"
	 * label would misrepresent the ordering.
	 */
	showTimestamp: boolean;
}

/**
 * The contract for a layout's loading skeleton. Each layout renders placeholder
 * cards in its own card shape so the loading state matches the populated feed.
 * `count` is the number of placeholder cards to render.
 */
export interface SpaceFeedSkeletonProps {
	count: number;
}
