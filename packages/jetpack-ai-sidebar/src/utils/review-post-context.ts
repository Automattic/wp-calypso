/**
 * Shared post-context helpers for the review components and the provider
 * entry (`index.ts`). A review payload is only actionable while the editor
 * still shows the post it was generated for.
 */

import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';

export type EditorPostId = number | string;

type WpCurrentPostStore = { getCurrentPostId?: () => EditorPostId | null };
type WpDataWindow = {
	wp?: {
		data?: {
			select?: ( store: string ) => WpCurrentPostStore | undefined;
		};
	};
};

export function normalizeEditorPostId( postId: unknown ): EditorPostId | undefined {
	if ( typeof postId === 'number' && postId > 0 ) {
		return postId;
	}
	if ( typeof postId === 'string' && postId.trim() ) {
		return postId;
	}
	return undefined;
}

/**
 * Reads the current post ID from the live editor store, outside React. Async
 * edit guards use this so navigation between a click and a delayed block write
 * is observed immediately.
 */
export function getCurrentEditorPostIdFromStore(): EditorPostId | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}
	try {
		const postId = ( window as unknown as WpDataWindow ).wp?.data
			?.select?.( 'core/editor' )
			?.getCurrentPostId?.();
		return normalizeEditorPostId( postId );
	} catch {
		return undefined;
	}
}

/**
 * Tracks whether the reviewed post still matches the editor. `isPostStale`
 * follows React renders; `isLatestPostContextStale` re-reads the store at
 * call time for guards that run after an await.
 */
export function useReviewPostContext( postId?: EditorPostId ): {
	isPostStale: boolean;
	isLatestPostContextStale: () => boolean;
} {
	const currentPostId = useSelect(
		( select ) =>
			normalizeEditorPostId(
				( select( 'core/editor' ) as WpCurrentPostStore )?.getCurrentPostId?.()
			),
		[]
	);
	const isPostStale = ! postId || ! currentPostId || String( postId ) !== String( currentPostId );
	const isLatestPostContextStale = useCallback( () => {
		const latestCurrentPostId = getCurrentEditorPostIdFromStore() ?? currentPostId;
		return ! postId || ! latestCurrentPostId || String( postId ) !== String( latestCurrentPostId );
	}, [ currentPostId, postId ] );

	return { isPostStale, isLatestPostContextStale };
}
