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
			post_thumbnail:
				'https://s0.wp.com/wp-content/themes/a8c/jetpackme-new/images/2021/home/security-2x.webp',
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
