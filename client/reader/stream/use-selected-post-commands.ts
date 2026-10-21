import { useCallback } from 'react';
import { usePostLikes } from 'calypso/components/data/post-likes';
import { useCachedPost } from 'calypso/reader/data/post/cache';
import { usePostLikeActions } from 'calypso/reader/data/post/likes';
import { isLikeable } from 'calypso/reader/post/capabilities';
import { showSelectedPost } from 'calypso/reader/utils';
import { getXPostMetadata } from 'calypso/reader/xpost-helper';
import type { StreamItem } from 'calypso/reader/data/stream/types';

export interface SelectedPostCommands {
	/** Open the selected post in the full-post view (`Enter`). No-op without a selection. */
	openSelected: () => void;
	/** Open the selected post's original URL in a new tab (`v`). No-op without a URL. */
	openSelectedInNewTab: () => void;
	/** Like/unlike the selected post (`l`), mirroring the legacy stream's guards. */
	toggleSelectedLike: () => void;
}

const isLiked = ( value: unknown ): boolean =>
	value === true || value === 1 || value === '1' || value === 'true';

const likeId = ( value: unknown ): number | string | null =>
	typeof value === 'number' || typeof value === 'string' ? value : null;

/**
 * Commands that operate on the currently selected post, shared by the stream
 * reading shortcuts across every surface (Stream V2 and the Spaces feed
 * layouts). Reads the post cache-only (no request waterfall) and toggles likes
 * through the same React Query mechanism the post-card like button uses.
 */
export function useSelectedPostCommands(
	selectedPostKey: StreamItem | null
): SelectedPostCommands {
	const selectedPost = useCachedPost( selectedPostKey );
	const { postLikes } = usePostLikes( likeId( selectedPost?.site_ID ), likeId( selectedPost?.ID ) );
	const likedPost = postLikes?.iLike;
	const { like, unlike, isLikePending, isUnlikePending } = usePostLikeActions();

	const openSelected = useCallback( () => {
		if ( ! selectedPostKey ) {
			return;
		}
		// `showSelectedPost` returns a thunk that navigates via the router; it routes
		// x-posts to the original post from the cached post body, so no extra guard here.
		showSelectedPost( {
			postKey: {
				blogId: selectedPostKey.blogId ? Number( selectedPostKey.blogId ) : undefined,
				feedId: selectedPostKey.feedId ? Number( selectedPostKey.feedId ) : undefined,
				postId: Number( selectedPostKey.postId ),
			},
		} )();
	}, [ selectedPostKey ] );

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
		if ( ! isLikeable( selectedPost ) ) {
			return;
		}
		const siteId = Number( selectedPost.site_ID );
		const postId = Number( selectedPost.ID );
		if ( ! siteId || ! postId ) {
			return;
		}
		const liked = likedPost ?? isLiked( selectedPost.i_like );
		if ( liked ? isUnlikePending : isLikePending ) {
			return;
		}
		const toggle = liked ? unlike : like;
		toggle( siteId, postId, { source: 'reader' } );
	}, [ selectedPost, likedPost, isLikePending, isUnlikePending, like, unlike ] );

	return { openSelected, openSelectedInNewTab, toggleSelectedLike };
}
