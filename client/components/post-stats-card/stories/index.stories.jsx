import PostStatsCard from '../';

export default { title: 'client/components/Post Stats Card' };

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

export const Default = () => (
	<div className="post-stats-card-story" style={ { margin: 'auto', maxWidth: '700px' } }>
		<PostStatsCardVariations />
	</div>
);

export const FullWidth = () => (
	<div className="post-stats-card-story">
		<PostStatsCardVariations />
	</div>
);

export const WithoutAThumbnail = () => (
	<div className="post-stats-card-story">
		<PostStatsCardVariations
			post={ {
				date: '2022-12-07T14:24:48+00:00',
				post_thumbnail: null,
				title: 'The moody trail',
			} }
		/>
	</div>
);
