import CommentList from '../comment-list/comment-list';
import TabView from './tab-view';
import type { PostSubscription } from '@automattic/data-stores/src/reader/types';

const posts: PostSubscription[] = [
	{
		id: '1',
		title: 'Alone at the Edge of the World',
		excerpt:
			'Susie Goodall wanted to circumnavigate the globe in a sailboat. She did it, but not without a few hiccups along the way.',
		site_title: 'Test Site 2022',
		site_icon: 'https://www.gravatar.com/avatar/',
		site_url: 'https://testsite2022.wordpress.com',
		date_subscribed: new Date( '2022-03-29T14:55:53+00:00' ),
	},
	{
		id: '2',
		title: '50 Years Ago, Stevie Wonder Heard the Future',
		excerpt:
			'On the anniversary of the landmark 1972 album “Talking Book,” the singer-songwriter reflects on the making of his masterpiece.',
		site_icon: 'https://www.gravatar.com/avatar/',
		site_title: 'April Site',
		site_url: 'https://testsite2023.wordpress.com',
		date_subscribed: new Date( '2023-01-04T17:55:53+00:00' ),
	},
];

const Comments = () => (
	<TabView errorMessage="" isLoading={ false }>
		<CommentList posts={ posts } />
	</TabView>
);

export default Comments;
