import { translate } from 'i18n-calypso';
import ReaderRedditIcon from 'calypso/reader/components/icons/reddit-icon';
import ReaderSubstackIcon from 'calypso/reader/components/icons/substack-icon';
import ReaderTumblrIcon from 'calypso/reader/components/icons/tumblr-icon';
import ReaderYouTubeIcon from 'calypso/reader/components/icons/youtube-icon';
import { isDiscoverV3Enabled } from 'calypso/reader/utils';

export type SubscriptionType = 'add-new' | 'reddit' | 'youtube' | 'tumblr' | 'substack';

interface AddSubscriptionFormConfig {
	slug: SubscriptionType;
	title: string;
	url: string;
	pathname: string; // @TODO: Remove when isDiscoverV3Enabled() is removed.
	placeholder?: string; // Use default if not provided.
	source: string;
	instructions?: {
		icon: JSX.Element | null;
		title: string;
		infoList: Array< { label: string; info: string } >;
	};
}

const BASE_URL: string = 'reader/new';
export const ADD_SUBSCRIPTION_CONFIGS: Record< SubscriptionType, AddSubscriptionFormConfig > =
	Object.freeze( {
		[ 'add-new' ]: {
			slug: 'add-new',
			title: translate( 'Add new' ),
			url: `/${ BASE_URL }`,
			pathname: isDiscoverV3Enabled() ? '/reader/new' : '/discover/add-new',
			source: isDiscoverV3Enabled() ? 'reader-add-new' : 'discover-add-new',
			placeholder: undefined,
		},
		[ 'reddit' ]: {
			slug: 'reddit',
			title: translate( 'Reddit' ),
			url: `/${ BASE_URL }/reddit`,
			pathname: isDiscoverV3Enabled() ? '/reader/new/reddit' : '/discover/reddit',
			source: isDiscoverV3Enabled() ? 'reader-add-reddit' : 'discover-reddit',
			placeholder: translate( 'Search by Reddit URL' ),
			instructions: {
				icon: <ReaderRedditIcon iconSize={ 75 } />,
				title: translate( 'Common Reddit URLs' ),
				infoList: [
					{ label: translate( 'Front page:' ), info: 'www.reddit.com/.rss' },
					{
						label: translate( 'A subreddit:' ),
						info: 'www.reddit.com/r/{ SUBREDDIT }/.rss',
					},
					{
						label: translate( 'A user:' ),
						info: 'www.reddit.com/user/{ REDDITOR }/.rss',
					},
					{
						label: translate( 'User comments:' ),
						info: 'www.reddit.com/user/{ REDDITOR }/comments/.rss',
					},
					{
						label: translate( 'User submissions:' ),
						info: 'www.reddit.com/user/{ REDDITOR }/submitted/.rss',
					},
					{
						label: translate( 'Search result:' ),
						info: 'www.reddit.com/search.rss?q={ QUERY }',
					},
				],
			},
		},
		[ 'youtube' ]: {
			slug: 'youtube',
			title: translate( 'YouTube' ),
			url: `/${ BASE_URL }/youtube`,
			pathname: '/reader/new/youtube',
			source: 'reader-add-youtube',
			placeholder: translate( 'Search by YouTube URL' ),
			instructions: {
				icon: <ReaderYouTubeIcon iconSize={ 75 } />,
				title: translate( 'Common YouTube URLs' ),
				infoList: [
					{ label: translate( 'Channel:' ), info: 'www.youtube.com/@YT_HANDLE' },
					{
						label: translate( 'Channel using ID:' ),
						info: 'https://www.youtube.com/channel/CHANNEL_ID',
					},
					{
						label: translate( 'Playlist:' ),
						info: 'www.youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID',
					},
				],
			},
		},
		[ 'tumblr' ]: {
			slug: 'tumblr',
			title: translate( 'Tumblr' ),
			url: `/${ BASE_URL }/tumblr`,
			pathname: '/reader/new/tumblr',
			source: 'new-tumblr-subscription',
			placeholder: translate( 'Search by Tumblr URL' ),
			instructions: {
				icon: <ReaderTumblrIcon iconSize={ 75 } />,
				title: translate( 'Common Tumblr URLs' ),
				infoList: [
					{ label: translate( 'Staff picks:' ), info: 'staff.tumblr.com/rss' },
					{ label: translate( 'A blog:' ), info: '{ BLOG_NAME }.tumblr.com/rss' },
					{
						label: translate( 'Blog tag:' ),
						info: '{ BLOG_NAME }.tumblr.com/tagged/{ TAG_NAME }/rss',
					},
				],
			},
		},
		[ 'substack' ]: {
			slug: 'substack',
			title: translate( 'Substack' ),
			url: `/${ BASE_URL }/substack`,
			pathname: '/reader/new/substack',
			source: 'reader-add-substack',
			placeholder: translate( 'Search by Substack URL' ),
			instructions: {
				icon: <ReaderSubstackIcon iconSize={ 75 } />,
				title: translate( 'Common Substack URLs' ),
				infoList: [
					{
						label: translate( 'Publication:' ),
						info: 'https://{ PUBLICATION }.substack.com',
					},
					{ label: translate( 'Custom domain:' ), info: 'https://{ CUSTOM_DOMAIN }/feed' },
				],
			},
		},
	} );
