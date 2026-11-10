import type {
	ReadConversationPostAuthor,
	ReadConversationPostDiscussion,
	ReadConversationReason,
} from '@automattic/api-core';

export interface Commenter {
	name: string;
	avatar: string;
}

/** What the detail pane shows of the post, when the list sends it. */
export interface ConversationPostDetails {
	siteName: string;
	siteIcon?: string;
	author?: ReadConversationPostAuthor;
	date?: string;
	excerpt: string;
	image?: string;
	discussion: ReadConversationPostDiscussion;
}

export interface Conversation {
	key: string;
	siteId: number;
	postId: number;
	title: string;
	url?: string;
	excerpt: string;
	timestamp: number;
	latestCommentId?: number;
	reason: ReadConversationReason;
	/** The newest commenters, the latest first. */
	commenters: Commenter[];
	commenterCount: number;
	unreadCount: number;
	unreadNoteIds: number[];
	/** The comments of `unreadNoteIds`, in the same order. */
	unreadCommentIds: number[];
	isFollowing: boolean;
	postDetails?: ConversationPostDetails;
}

/** A comment the current user left. Your comments lists the latest one on each post. */
export interface OwnComment {
	key: string;
	siteId: number;
	postId: number;
	commentId: number;
	title: string;
	excerpt: string;
	timestamp: number;
	author: Commenter;
	newCommentCount: number;
}
