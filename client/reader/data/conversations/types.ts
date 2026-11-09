import type { ReadConversationReason } from '@automattic/api-core';

export interface Commenter {
	name: string;
	avatar: string;
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
}

/** A comment the current user left, one per comment. */
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
