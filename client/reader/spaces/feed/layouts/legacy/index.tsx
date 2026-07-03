import { ReaderStreamV2 } from 'calypso/reader/stream/stream-v2';
import type { SpaceFeedLayoutProps } from '../types';

import './style.scss';

/**
 * Legacy layout: the classic vertical reading experience — a single column of
 * post cards — now on the `useInfiniteList` engine via {@link ReaderStreamV2},
 * instead of the Redux + `<InfiniteList>` classic stream. It owns its own data
 * and scrolls on the shell's Reader container like the other layouts.
 *
 * Reads the shell's `streamKey` — the same per-space query every layout uses —
 * so switching to/from this layout never refetches (React Query dedupes).
 *
 * `showTimestamp` is intentionally unsupported: ReaderStreamV2 owns its own card
 * rendering and always shows timestamps, so a `legacy`-layout Space still shows
 * them on its Discover tab. Suppressing them there would require changes in the
 * shared classic stream, out of scope for the per-space layouts.
 */
export function LegacyLayout( { streamKey, scrollElement, restoreKey }: SpaceFeedLayoutProps ) {
	return (
		<ReaderStreamV2
			streamKey={ streamKey }
			scrollElement={ scrollElement }
			className="space-feed-legacy"
			restoreKey={ restoreKey }
		/>
	);
}
