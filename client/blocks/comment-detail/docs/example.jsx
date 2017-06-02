/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CommentDetail from 'blocks/comment-detail';
import CommentDetailPlaceholder from 'blocks/comment-detail/comment-detail-placeholder';

// Mock data
const mockAuthor = {
	avatarUrl: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=G',
	displayName: 'Test User',
	email: 'test@test.com',
	id: 12345678,
	ip: '127.0.0.1',
	isBlocked: false,
	url: 'http://discover.wordpress.com',
	username: 'testuser',
};

const mockComment = {
	content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Contemnit enim disserendi elegantiam, confuse loquitur. Suo genere perveniant ad extremum; Id mihi magnum videtur. Vide, quantum, inquam, fallare, Torquate. Aliter homines, aliter philosophos loqui putas oportere? Perge porro; Quibus ego vehementer assentior. Tubulo putas dicere? Sed ille, ut dixi, vitiose. Refert tamen, quo modo. Quid nunc honeste dicit? Scrupulum, inquam, abeunti; Quam si explicavisset, non tam haesitaret. Sed quid sentiat, non videtis. At enim sequor utilitatem. Si longus, levis.',
	date: '2017-05-12 16:00:00',
	id: 12345678,
	isLiked: false,
	replied: true,
	status: 'approved',
};

const mockPost = {
	authorDisplayName: 'Test User',
	title: 'Test Post',
	url: 'http://discover.wordpress.com',
};

const mockSite = {
	id: 3584907,
};


export const CommentDetailExample = () =>
	<div>
		<CommentDetailPlaceholder />

		<CommentDetail
			authorAvatarUrl={ mockAuthor.avatarUrl }
			authorDisplayName={ mockAuthor.displayName }
			authorEmail={ mockAuthor.email }
			authorId={ mockAuthor.id }
			authorIp={ mockAuthor.ip }
			authorIsBlocked={ mockAuthor.isBlocked }
			authorUrl={ mockAuthor.url }
			authorUsername={ mockAuthor.username }

			commentContent={ mockComment.content }
			commentDate={ mockComment.date }
			commentId={ mockComment.id }
			commentIsLiked={ mockComment.isLiked }
			commentStatus={ mockComment.status }
			repliedToComment={ mockComment.replied }

			postAuthorDisplayName={ mockPost.authorDisplayName }
			postTitle={ mockPost.title }
			postUrl={ mockPost.url }

			siteId={ mockSite.id }
		/>
		<CommentDetail
			authorAvatarUrl={ mockAuthor.avatarUrl }
			authorDisplayName={ mockAuthor.displayName }
			authorEmail={ mockAuthor.email }
			authorId={ mockAuthor.id }
			authorIp={ mockAuthor.ip }
			authorIsBlocked={ mockAuthor.isBlocked }
			authorUrl={ mockAuthor.url }
			authorUsername={ mockAuthor.username }

			commentContent={ mockComment.content }
			commentDate={ mockComment.date }
			commentId={ mockComment.id }
			commentIsLiked={ mockComment.isLiked }
			commentStatus={ mockComment.status }
			repliedToComment={ mockComment.replied }

			postAuthorDisplayName={ mockPost.authorDisplayName }
			postTitle={ mockPost.title }
			postUrl={ mockPost.url }

			siteId={ mockSite.id }
		/>
		<CommentDetail
			authorAvatarUrl={ mockAuthor.avatarUrl }
			authorDisplayName={ mockAuthor.displayName }
			authorEmail={ mockAuthor.email }
			authorId={ mockAuthor.id }
			authorIp={ mockAuthor.ip }
			authorIsBlocked={ mockAuthor.isBlocked }
			authorUrl={ mockAuthor.url }
			authorUsername={ mockAuthor.username }

			commentContent={ mockComment.content }
			commentDate={ mockComment.date }
			commentId={ mockComment.id }
			commentIsLiked={ mockComment.isLiked }
			commentStatus={ mockComment.status }
			repliedToComment={ mockComment.replied }

			postAuthorDisplayName={ mockPost.authorDisplayName }
			postTitle={ mockPost.title }
			postUrl={ mockPost.url }

			siteId={ mockSite.id }
		/>
	</div>;

CommentDetailExample.displayName = 'CommentDetail';

export default CommentDetailExample;
