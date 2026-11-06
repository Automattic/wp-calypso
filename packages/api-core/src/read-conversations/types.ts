export type ReadConversationsScope = 'following' | 'commented';

export type ReadConversationsSort = 'newest' | 'most_active';

/**
 * Why a conversation is in the user's list, most specific first. `reply` and
 * `mention` describe the latest comment.
 */
export type ReadConversationReason = 'reply' | 'mention' | 'own_post' | 'commented' | 'following';

export interface ReadConversationPerson {
	name: string;
	avatar: string | null;
	url: string | null;
}

export interface ReadConversationPost {
	title: string;
	url: string;
	/** ISO 8601 date the post was published. */
	date: string | null;
}

export interface ReadConversationSite {
	name: string;
	icon: string | null;
	url: string | null;
}

export interface ReadConversationComment {
	id: number;
	excerpt: string;
	/** ISO 8601 GMT date the comment was left. */
	date: string | null;
	url: string;
	author: ReadConversationPerson;
}

export interface ReadConversation {
	/** `{blog_id}-p-{post_id}` */
	id: string;
	blog_id: number;
	post_id: number;
	post: ReadConversationPost;
	site: ReadConversationSite;
	comment_count: number;
	/** The newest distinct commenters, at most five. */
	commenters: ReadConversationPerson[];
	/** Distinct authors of the 10 newest comments, so it tops out at 10. */
	commenter_count: number;
	latest_comment: ReadConversationComment | null;
	reason: ReadConversationReason;
	/** Null when the user has no comment notes for the post, which is unknown, not zero. */
	unread_count: number | null;
	/** At most 50; `unread_count` counts the rest. */
	unread_note_ids: number[];
	/** The comments of `unread_note_ids`, in the same order. */
	unread_comment_ids: number[];
	/** Whether the user explicitly follows the conversation. */
	is_following: boolean;
}

export interface ReadConversationsParams {
	scope?: ReadConversationsScope;
	sort?: ReadConversationsSort;
	number?: number;
	cursor?: string;
	/** Matches post titles only, at most 100 characters. */
	search?: string;
}

/**
 * Response shape for `GET /wpcom/v2/read/conversations`.
 */
export interface ReadConversationsResponse {
	conversations: ReadConversation[];
	next_cursor: string | null;
	/** An upper bound on the conversations with unread comment notes. */
	unread_total: number;
}

export interface ReadConversationOwnComment {
	/** `{blog_id}-p-{post_id}-c-{comment_id}` */
	id: string;
	blog_id: number;
	post_id: number;
	comment_id: number;
	post: ReadConversationPost;
	site: ReadConversationSite;
	comment: ReadConversationComment;
	/** Comments by others on the post newer than this one. Null when it couldn't be read. */
	new_comment_count: number | null;
}

export type ReadConversationsCommentsParams = Omit< ReadConversationsParams, 'scope' >;

/**
 * Response shape for `GET /wpcom/v2/read/conversations/comments`: one row per
 * comment the user left. A page can be empty while `next_cursor` is set.
 */
export interface ReadConversationsCommentsResponse {
	comments: ReadConversationOwnComment[];
	next_cursor: string | null;
}

/**
 * Response shape for `POST /wpcom/v2/read/sites/{blog_id}/posts/{post_id}/unfollow`.
 */
export interface ReadConversationUnfollowResponse {
	success: boolean;
}
