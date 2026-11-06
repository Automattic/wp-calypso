import type {
	ReadConversation,
	ReadConversationOwnComment,
	ReadConversationReason,
} from '@automattic/api-core';

// One date per module load, so every fixture lands in the same day section.
const DEFAULT_DATE = new Date().toISOString();

const person = ( name: string ) => ( {
	name,
	avatar: `https://example.com/${ name }.png`,
	url: null,
} );

export const makeConversation = ( {
	blogId = 10,
	postId = 100,
	title = 'A post title',
	commenters = [ 'Ana' ],
	excerpt = 'A comment excerpt',
	date = DEFAULT_DATE,
	commentId = postId * 10 + 1,
	reason = 'following',
	unreadNoteIds = [],
	isFollowing = false,
}: {
	blogId?: number;
	postId?: number;
	title?: string;
	commenters?: string[];
	excerpt?: string;
	date?: string;
	commentId?: number;
	reason?: ReadConversationReason;
	unreadNoteIds?: number[];
	isFollowing?: boolean;
} = {} ): ReadConversation => ( {
	id: `${ blogId }-p-${ postId }`,
	blog_id: blogId,
	post_id: postId,
	post: { title, url: `https://example.com/${ postId }`, date },
	site: { name: 'A blog', icon: null, url: 'https://example.com' },
	comment_count: commenters.length,
	commenters: commenters.map( person ),
	commenter_count: commenters.length,
	latest_comment: {
		id: commentId,
		excerpt,
		date,
		url: `https://example.com/${ postId }#comment-${ commentId }`,
		author: person( commenters[ 0 ] ),
	},
	reason,
	unread_count: unreadNoteIds.length || null,
	unread_note_ids: unreadNoteIds,
	is_following: isFollowing,
} );

export const makeOwnComment = ( {
	blogId = 10,
	postId = 100,
	commentId = 5000,
	title = 'A post title',
	excerpt = 'My comment',
	newCommentCount = 0,
}: {
	blogId?: number;
	postId?: number;
	commentId?: number;
	title?: string;
	excerpt?: string;
	newCommentCount?: number | null;
} = {} ): ReadConversationOwnComment => ( {
	id: `${ blogId }-p-${ postId }-c-${ commentId }`,
	blog_id: blogId,
	post_id: postId,
	comment_id: commentId,
	post: { title, url: `https://example.com/${ postId }`, date: DEFAULT_DATE },
	site: { name: 'A blog', icon: null, url: 'https://example.com' },
	comment: {
		id: commentId,
		excerpt,
		date: DEFAULT_DATE,
		url: `https://example.com/${ postId }#comment-${ commentId }`,
		author: person( 'Me' ),
	},
	new_comment_count: newCommentCount,
} );
