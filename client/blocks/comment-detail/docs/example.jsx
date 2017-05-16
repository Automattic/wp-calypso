/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CommentDetail from 'blocks/comment-detail';

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
	isApproved: true,
	isLiked: false,
	isSpam: false,
	isTrash: false,
	replied: true,
};

const mockPost = {
	authorDisplayName: 'Test User',
	title: 'Test Post',
	url: 'http://discover.wordpress.com',
};

const mockSite = {
	icon: 'https://secure.gravatar.com/blavatar/c9e4e04719c81ca4936a63ea2dce6ace?s=120',
	name: 'Test Site',
};


export const CommentDetailExample = () =>
	<div>
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
			commentIsApproved={ mockComment.isApproved }
			commentIsLiked={ mockComment.isLiked }
			commentIsSpam={ mockComment.isSpam }
			commentIsTrash={ mockComment.isTrash }
			repliedToComment={ mockComment.replied }

			postAuthorDisplayName={ mockPost.authorDisplayName }
			postTitle={ mockPost.title }
			postUrl={ mockPost.url }

			siteIcon={ mockSite.icon }
			siteName={ mockSite.title }
		/>
	</div>;

CommentDetailExample.displayName = 'CommentDetail';

export default CommentDetailExample;
