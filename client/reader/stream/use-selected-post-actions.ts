import { useCallback } from 'react';
import { useCachedPost } from 'calypso/reader/data/post/cache';
import { usePostLikeActions } from 'calypso/reader/data/post/likes';
import { isLikeable } from 'calypso/reader/post/capabilities';
import { getXPostMetadata } from 'calypso/reader/xpost-helper';
import type { StreamItem } from 'calypso/reader/data/stream/types';

export interface SelectedPostActions {
	/** Open the selected post's original URL in a new tab (`v`). No-op without a URL. */
	openSelectedInNewTab: () => void;
	/** Like/unlike the selected post (`l`), mirroring the legacy stream's guards. */
	toggleSelectedLike: () => void;
}

/**
 * Actions that operate on the currently selected post, shared by the stream
 * reading shortcuts across every surface (Stream V2 and the Spaces feed
 * layouts). Reads the post cache-only (no request waterfall) and toggles likes
 * through the same React Query mechanism the post-card like button uses.
 */
export function useSelectedPostActions( selectedPostKey: StreamItem | null ): SelectedPostActions {
	const selectedPost = useCachedPost( selectedPostKey );
	const { like, unlike, isLikePending, isUnlikePending } = usePostLikeActions();

	const openSelectedInNewTab = useCallback( () => {
		const url = selectedPost?.URL;
		if ( typeof url === 'string' ) {
			window.open( url, '_blank', 'noreferrer,noopener' );
		}
	}, [ selectedPost ] );

	const toggleSelectedLike = useCallback( () => {
		if ( ! selectedPost ) {
			return;
		}
		// The legacy stream skips x-posts (they route to the original post).
		const xPostMetadata = getXPostMetadata( selectedPost ) as { postURL?: string | null } | null;
		if ( xPostMetadata?.postURL ) {
			return;
		}
		if ( ! isLikeable( selectedPost ) || isLikePending || isUnlikePending ) {
			return;
		}
		const siteId = Number( selectedPost.site_ID );
		const postId = Number( selectedPost.ID );
		if ( ! siteId || ! postId ) {
			return;
		}
		const toggle = selectedPost.i_like ? unlike : like;
		toggle( siteId, postId, { source: 'reader' } );
	}, [ selectedPost, isLikePending, isUnlikePending, like, unlike ] );

	return { openSelectedInNewTab, toggleSelectedLike };
}
