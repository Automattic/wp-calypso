/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CommentDetail from 'blocks/comment-detail';

// Mock data
const mockSite = {
	icon: 'https://secure.gravatar.com/blavatar/c9e4e04719c81ca4936a63ea2dce6ace?s=120',
	name: 'Test Site',
}
const mockUser = {
	avatar_URL: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=G',
	comments: 15,
	email: 'test@test.com',
	has_avatar: true,
	ip: '127.0.0.1',
	name: 'Matt',
	username: 'matt',
	URL: 'http://discover.wordpress.com',
};

const mockComment = {
	author: mockUser,
	body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Contemnit enim disserendi elegantiam, confuse loquitur. Suo genere perveniant ad extremum; Id mihi magnum videtur. Vide, quantum, inquam, fallare, Torquate. Aliter homines, aliter philosophos loqui putas oportere? Perge porro; Quibus ego vehementer assentior. Tubulo putas dicere? Sed ille, ut dixi, vitiose. Refert tamen, quo modo. Quid nunc honeste dicit? Scrupulum, inquam, abeunti; Quam si explicavisset, non tam haesitaret. Sed quid sentiat, non videtis. At enim sequor utilitatem. Si longus, levis.',
	date: '2017-05-12 16:00:00',
};
const mockPost = {
	author: mockUser,
	date: '2017-05-12 16:00:00',
	site: mockSite,
	title: 'Test Post Title',
	url: 'http://discover.wordpress.com',
};

export const CommentDetailExample = () =>
	<div>
		<CommentDetail
			comment={ mockComment }
			post={ mockPost }
		/>
		<CommentDetail
			comment={ mockComment }
			post={ mockPost }
		/>
		<CommentDetail
			comment={ mockComment }
			post={ mockPost }
		/>
	</div>;

CommentDetailExample.displayName = 'CommentDetail';

export default CommentDetailExample;
