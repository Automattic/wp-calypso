/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CommentDetail from 'blocks/comment-detail';

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
}

const mockSite = {
	id: 3584907,
};

export const CommentDetailExample = () =>
	<div>
		<CommentDetail
			commentId={ mockComment.ID }
			siteId={ mockSite.ID }
			{ ...mockComment }
		/>
		<CommentDetail
			commentId={ mockComment.ID }
			siteId={ mockSite.ID }
			{ ...mockComment }
		/>
		<CommentDetail
			commentId={ mockComment.ID }
			siteId={ mockSite.ID }
			{ ...mockComment }
		/>
	</div>;

CommentDetailExample.displayName = 'CommentDetail';

export default CommentDetailExample;
