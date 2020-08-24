/**
 * External dependencies
 */
import { pickBy } from 'lodash';

export const toAuthor = ( { avatar_URL, email, ID, name } ) => {
	if ( ID > 0 ) {
		return {
			kind: 'known',
			userId: parseInt( ID, 10 ),
		};
	}

	return Object.assign(
		{ kind: 'anonymous' },
		avatar_URL && { avatar: avatar_URL },
		email && { email },
		name && { displayName: name }
	);
};

export const toWpcomUser = ( author ) =>
	pickBy(
		{
			ID: author.ID,
			avatar_URL: author.avatarURL,
			display_name: author.name,
			email: author.email,
			primary_blog: author.site_ID,
			primary_blog_url: author.URL,
			username: author.login,
		},
		( a ) => !! a
	);

export const validStatusValues = {
	approved: 'approved',
	spam: 'spam',
	trash: 'trash',
	unapproved: 'pending',
};

/**
 * Attempts to parse a response from the comment endpoint
 * and return the mapped comment object with its author
 *
 * @param {number} siteId site id is not included in the response items
 * @param {object} data raw comment data from API
 * @returns {object} comment and WordPress.com user if available
 */
export const fromApi = ( siteId, data ) => {
	try {
		return Object.assign(
			{
				comment: Object.assign(
					{
						state: 'loaded',
						author: toAuthor( data.author ),
						commentId: parseInt( data.ID, 10 ),
						content: data.content,
						createdAt: Date.parse( data.date ),
						isLiked: Boolean( data.i_like ),
					},
					data.parent &&
						data.parent.type === 'comment' && { parentId: parseInt( data.parent.ID, 10 ) },
					{
						postId: parseInt( data.post.ID, 10 ),
						siteId,
						status: validStatusValues[ data.status ],
					}
				),
			},
			data.author.ID > 0 && { user: toWpcomUser( data.author ) }
		);
	} catch ( e ) {
		return {
			state: 'error',
			error: 'invalid data structure',
		};
	}
};
