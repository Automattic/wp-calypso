import CommentList from '../comment-list/comment-list';
import TabView from './tab-view';
import type { PostSubscription } from '@automattic/data-stores/src/reader/types';

const posts: PostSubscription[] = [
	{
		id: '1',
		title: 'Post Title 1',
		excerpt: 'Post excerpt 1',
		site_icon: 'https://www.gravatar.com/avatar/',
		site_url: 'https://testsite2022.wordpress.com',
		date_subscribed: '2022-03-29T14:55:53+00:00',
	},
	{
		id: '2',
		title: 'April Post',
		excerpt: 'This post was written on the April 1st, 2023.',
		site_icon: 'https://www.gravatar.com/avatar/',
		site_url: 'https://testsite2023.wordpress.com',
		date_subscribed: '2023-01-04T17:55:53+00:00',
	},
];

const Comments = () => (
	<TabView errorMessage="" isLoading={ false }>
		<CommentList posts={ posts } />
	</TabView>
);

export default Comments;
