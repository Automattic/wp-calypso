import type {
	ReadConversationPostAuthor,
	ReadConversationPostDiscussion,
	ReadConversationReason,
} from '@automattic/api-core';

export interface Commenter {
	name: string;
	avatar: string;
}

export interface ConversationPostDetails {
	siteName: string;
	siteIcon: string | null;
	author: ReadConversationPostAuthor | null;
	date: string | null;
	excerpt: string;
	image: string | null;
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
