// TODO: Unify with ReaderPost interfaces in reader/get-helpers.ts and reader/recent/types.ts
interface ReaderPost {
	site_ID?: number;
	site_is_private?: boolean;
	is_external?: boolean;
	sharing_enabled?: boolean;
	likes_enabled?: boolean;
	discussion?: {
		comments_open?: boolean;
		comment_count?: number;
		comments_require_registration?: boolean;
	};
}

export function isCommentsOpen( post: ReaderPost ): boolean {
	return !! post.discussion?.comments_open;
}

export function isLoginRequiredToComment( post: ReaderPost ): boolean {
	return !! post.discussion?.comments_require_registration;
}

export function isSharable( post: ReaderPost ): boolean {
	if ( post?.site_is_private ) {
		return false;
	}

	// Treat sharing as enabled by default; only disable when explicitly set to false.
	return post?.sharing_enabled !== false;
}

export function isRebloggable( post: ReaderPost, hasSites: boolean ): boolean {
	if ( ! post?.site_ID ) {
		return false;
	}

	if ( post?.site_is_private || ! hasSites || post.is_external ) {
		return false;
	}

	return post?.sharing_enabled !== false;
}

export function isLikeable( post: ReaderPost ): boolean {
	if ( ! post?.site_ID ) {
		return false;
	}

	if ( post.is_external ) {
		return false;
	}

	// Default to likes enabled unless explicitly disabled
	return post?.likes_enabled !== false;
}

export function isConversationFollowable( post: ReaderPost ): boolean {
	return !! post?.site_ID && ! post?.is_external && isCommentsOpen( post );
}
