import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { CommentList } from 'calypso/landing/subscriptions/components/comment-list';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import TabView from '../tab-view';
import type { PostSubscription } from '@automattic/data-stores/src/reader/types';

const noop = () => {};

const posts: PostSubscription[] = [
	{
		id: '1',
		title: 'Alone at the Edge of the World',
		excerpt:
			'Susie Goodall wanted to circumnavigate the globe in a sailboat. She did it, but not without a few hiccups along the way.',
		url: 'https://testsite2022.wordpress.com/2021/03/29/alone-at-the-edge-of-the-world/',
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
		url: 'https://testsite2023.wordpress.com/2021/03/29/50-years-ago-stevie-wonder-heard-the-future/',
		site_icon: 'https://www.gravatar.com/avatar/',
		site_title: 'April Site',
		site_url: 'https://testsite2023.wordpress.com',
		date_subscribed: new Date( '2023-01-04T17:55:53+00:00' ),
	},
];

// repeat input array x times
const repeat = ( arr: PostSubscription[], times: number ) =>
	Array.from( { length: times }, () => arr ).flat() as PostSubscription[];

const Comments = () => {
	const translate = useTranslate();
	return (
		<TabView errorMessage="" isLoading={ false }>
			<div className="subscriptions-manager__list-actions-bar">
				<SearchInput
					placeholder={ translate( 'Search by post name...' ) }
					searchIcon={ <SearchIcon /> }
					onSearch={ noop }
				/>
			</div>

			<CommentList posts={ repeat( posts, 500 ) } />
		</TabView>
	);
};

export default Comments;
