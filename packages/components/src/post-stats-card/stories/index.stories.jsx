import PostStatsCard from '../';

export default { title: 'Post Stats Card' };

const PostStatsCardVariations = ( props ) => (
	<PostStatsCard
		commentCount={ 7 }
		heading="Latest post"
		likeCount={ 83 }
		viewCount={ 912 }
		post={ {
			date: '2022-12-07T14:24:48+00:00',
			post_thumbnail: 'https://images.unsplash.com/photo-1670510521067-2e94183f9803',
			title: 'The moody trail',
		} }
		{ ...props }
	/>
);

export const Default = () => <PostStatsCardVariations />;

export const WithoutAThumbnail = () => (
	<PostStatsCardVariations
		post={ {
			date: '2022-12-07T14:24:48+00:00',
			post_thumbnail: null,
			title: 'The moody trail',
		} }
	/>
);
