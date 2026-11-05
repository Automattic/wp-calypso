import type { NotificationNote as Note } from '@automattic/api-core';

// One timestamp per module load, so notes built in the same fixture never differ by a
// millisecond and the stable sort in groupNotesByPost keeps them in fixture order.
const DEFAULT_TIMESTAMP = new Date().toISOString();

const POST_TITLE_SUBJECT = ( name: string, title: string ) => {
	const text = `${ name } commented on ${ title }`;
	return {
		text,
		ranges: [
			{
				type: 'post',
				indices: [ text.length - title.length, text.length ] as [ number, number ],
				id: 1,
			},
		],
	};
};

export const makeNote = ( {
	id,
	siteId = 10,
	postId = 100,
	commentId = id * 1000,
	title = 'A post title',
	commenter = 'Ana',
	avatar = `https://example.com/${ commenter }.png`,
	excerpt = 'A comment excerpt',
	timestamp = DEFAULT_TIMESTAMP,
	read = 0,
	parentCommentId,
	headerUserId,
	...overrides
}: Partial< Note > & {
	id: number;
	siteId?: number;
	postId?: number;
	commentId?: number;
	commenter?: string;
	avatar?: string;
	excerpt?: string;
	parentCommentId?: number;
	headerUserId?: number;
} ): Note => ( {
	id,
	type: 'comment',
	read,
	timestamp,
	icon: avatar,
	title: 'Comment',
	noticon: '\uf300',
	meta: {
		ids: { site: siteId, post: postId, comment: commentId, parent_comment: parentCommentId },
	},
	subject: [ POST_TITLE_SUBJECT( commenter, title ), { text: excerpt } ],
	...( headerUserId && {
		header: [
			{
				text: 'Author',
				ranges: [ { type: 'user', indices: [ 0, 6 ] as [ number, number ], id: headerUserId } ],
			},
		],
	} ),
	body: [
		{ type: 'user', text: commenter, media: [ { type: 'image', indices: [ 0, 0 ], url: avatar } ] },
	],
	...overrides,
} );
