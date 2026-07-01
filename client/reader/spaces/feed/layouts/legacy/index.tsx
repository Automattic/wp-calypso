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
