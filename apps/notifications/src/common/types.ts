/**
 * Payload types for WordPress.com notifications, shared by every renderer
 * (panel, dashboard inbox, standalone). This module is part of `src/common`,
 * the pure shared layer: no imports from `src/app`, `src/panel`, React, Redux,
 * `@wordpress/*`, or any i18n system.
 */
export type Range = {
	type: string;
	indices: [ number, number ];
	id: string | number;
	parent: string | number | null;
	url?: string;
	site_id?: number;
	post_id?: number;
	class?: string;
	style?: string;
	context?: string;
};

export type Media = {
	type: 'image' | 'badge';
	indices: [ number, number ];
	url: string;
	id?: string | number;
	parent?: string | number | null;
	height?: string | number;
	width?: string | number;
};

export type Subject = {
	text: string;
	ranges?: Range[];
	media?: Media[];
};

type PostActions = { 'replyto-comment'?: boolean; 'like-post'?: boolean };

type CommentActions = {
	'spam-comment'?: boolean;
	'trash-comment'?: boolean;
	'approve-comment'?: boolean;
	'edit-comment'?: boolean;
	'replyto-comment'?: boolean;
	'like-comment'?: boolean;
};

type UserActions = { follow?: boolean };

type Actions = PostActions | CommentActions | UserActions;

export type Block = {
	text: string;
	ranges?: Range[];
	media?: Media[];
	actions?: Actions;
	meta?: {
		ids?: {
			site?: number;
			post?: number;
			comment?: number;
			reply_comment?: number;
			user?: number;
		};
		links?: {
			site?: string;
			post?: string;
			comment?: string;
			reply_comment?: string;
			user?: string;
			home?: string;
		};
		titles?: {
			home?: string;
			tagline?: string;
		};
		is_mobile_button?: boolean;
	};
	type?: 'post' | 'comment' | 'user';
	nest_level?: number;
	edit_comment_link?: string;
	new_post_link?: string;
};

export type BlockWithSignature = {
	block: Block;
	signature: {
		type: 'text' | 'reply' | 'prompt' | 'comment' | 'post' | 'user';
		id: number | null;
	};
};

export type Note = {
	id: number;
	type: string;
	read: number;
	noticon: string;
	timestamp: string;
	icon: string;
	url: string;
	meta?: {
		ids?: {
			site?: number;
			post?: number;
			comment?: number;
			reply_comment?: number;
			user?: number;
		};
		links?: {
			site?: string;
			post?: string;
			comment?: string;
			reply_comment?: string;
			user?: string;
			home?: string;
		};
	};
	title: string;
	note_hash: number;
	subject: Subject[];
	header?: Subject[]; // present in some note types
	body: Block[];
};
