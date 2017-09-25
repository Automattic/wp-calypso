/**
 * External dependencies
 */
import { map } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import CommentFaker from './comment-faker';
import CommentDetail from 'blocks/comment-detail';
import CommentDetailPlaceholder from 'blocks/comment-detail/comment-detail-placeholder';

// Mock data
const mockComment = {
	author: {
		avatar_URL: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=G',
		email: 'test@test.com',
		ID: 12345678,
		ip: '127.0.0.1',
		isBlocked: false,
		name: 'Test User',
		nice_name: 'testuser',
		URL: 'http://discover.wordpress.com',
	},
	content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Contemnit enim disserendi elegantiam, confuse loquitur. Suo genere perveniant ad extremum; Id mihi magnum videtur. Vide, quantum, inquam, fallare, Torquate. Aliter homines, aliter philosophos loqui putas oportere? Perge porro; Quibus ego vehementer assentior. Tubulo putas dicere? Sed ille, ut dixi, vitiose. Refert tamen, quo modo. Quid nunc honeste dicit? Scrupulum, inquam, abeunti; Quam si explicavisset, non tam haesitaret. Sed quid sentiat, non videtis. At enim sequor utilitatem. Si longus, levis.',
	date: '2017-05-12 16:00:00',
	ID: 12345678,
	i_like: false,
	post: {
		author: { name: 'Test User' },
		title: 'Test Post',
		link: 'http://discover.wordpress.com',
	},
	replied: true,
	status: 'approved',
	URL: 'http://discover.wordpress.com',
}

const mockSite = {
	id: 3584907,
};

const mockComments = [
	{ ...mockComment, ID: 1 },
	{ ...mockComment, ID: 2 },
	{ ...mockComment, ID: 3 },
];

const CommentList = ( {
	comments,
	setCommentStatus,
	toggleCommentLike,
} ) =>
	<div>
		{ map( comments, comment =>
			<CommentDetail
				comment={ comment }
				key={ comment.ID }
				setCommentStatus={ setCommentStatus }
				siteId={ mockSite.id }
				toggleCommentLike={ toggleCommentLike }
			/>
		) }
	</div>;

const CommentListFake = CommentFaker( CommentList );

export const CommentDetailExample = () =>
	<div>
		<CommentDetailPlaceholder />
		<CommentListFake comments={ mockComments } status="all" />
	</div>;

CommentDetailExample.displayName = 'CommentDetail';

export default CommentDetailExample;
