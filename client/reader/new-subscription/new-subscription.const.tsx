import { translate } from 'i18n-calypso';
import ReaderRedditIcon from 'calypso/reader/components/icons/reddit-icon';
import ReaderSubstackIcon from 'calypso/reader/components/icons/substack-icon';
import ReaderTumblrIcon from 'calypso/reader/components/icons/tumblr-icon';
import ReaderYouTubeIcon from 'calypso/reader/components/icons/youtube-icon';
import { isDiscoverV3Enabled } from 'calypso/reader/utils';

export type NewSubscriptionType = 'add-new' | 'reddit' | 'youtube' | 'tumblr' | 'substack';

export interface ReaderNewSubscriptionConfig {
	icon: JSX.Element | null;
	instructionsTitle: string;
	instructions: Array< { label: string; instruction: string } >;
	url: string;
	pathname: string;
	placeholder?: string; // Use default if not provided.
	slug: NewSubscriptionType;
	source: string;
	title: string;
}

const BASE_URL: string = 'reader/new';
export const NEW_SUBSCRIPTION_CONFIG: Record< NewSubscriptionType, ReaderNewSubscriptionConfig > = {
	[ 'add-new' ]: {
		slug: 'add-new',
		title: translate( 'Add new' ),
		url: `/${ BASE_URL }`,
		pathname: isDiscoverV3Enabled() ? '/reader/new' : '/discover/add-new',
		source: isDiscoverV3Enabled() ? 'reader-add-new' : 'discover-add-new',
		placeholder: undefined,

		// For "Add New" tab we don't show instructions and instead show the subscriptions list.
		icon: null,
		instructionsTitle: '',
		instructions: [],
	},
	[ 'reddit' ]: {
		slug: 'reddit',
		title: translate( 'Reddit' ),
		url: `/${ BASE_URL }/reddit`,
		pathname: isDiscoverV3Enabled() ? '/reader/new/reddit' : '/discover/reddit',
		source: isDiscoverV3Enabled() ? 'reader-add-reddit' : 'discover-reddit',
		placeholder: translate( 'Search by Reddit URL' ),
		icon: <ReaderRedditIcon iconSize={ 75 } />,
		instructionsTitle: translate( 'Common Reddit URLs' ),
		instructions: [
			{ label: translate( 'Front page:' ), instruction: 'www.reddit.com/.rss' },
			{
				label: translate( 'A subreddit:' ),
				instruction: 'www.reddit.com/r/{ SUBREDDIT }/.rss',
			},
			{
				label: translate( 'A user:' ),
				instruction: 'www.reddit.com/user/{ REDDITOR }/.rss',
			},
			{
				label: translate( 'User comments:' ),
				instruction: 'www.reddit.com/user/{ REDDITOR }/comments/.rss',
			},
			{
				label: translate( 'User submissions:' ),
				instruction: 'www.reddit.com/user/{ REDDITOR }/submitted/.rss',
			},
			{
				label: translate( 'Search result:' ),
				instruction: 'www.reddit.com/search.rss?q={ QUERY }',
			},
		],
	},
	[ 'youtube' ]: {
		slug: 'youtube',
		title: translate( 'YouTube' ),
		url: `/${ BASE_URL }/youtube`,
		pathname: '/reader/new/youtube',
		source: 'reader-add-youtube',
		placeholder: translate( 'Search by YouTube URL' ),
		icon: <ReaderYouTubeIcon iconSize={ 75 } />,
		instructionsTitle: translate( 'Common YouTube URLs' ),
		instructions: [
			{ label: translate( 'Channel feed:' ), instruction: 'www.youtube.com/@YT_HANDLE' },
			{
				label: translate( 'Playlist feed:' ),
				instruction: 'www.youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID',
			},
		],
	},
	[ 'tumblr' ]: {
		slug: 'tumblr',
		title: translate( 'Tumblr' ),
		url: `/${ BASE_URL }/tumblr`,
		pathname: '/reader/new/tumblr',
		source: 'new-tumblr-subscription',
		placeholder: translate( 'Search by Tumblr URL' ),
		icon: <ReaderTumblrIcon iconSize={ 75 } />,
		instructionsTitle: translate( 'Common Tumblr URLs' ),
		instructions: [
			{ label: translate( 'Staff Picks:' ), instruction: 'staff.tumblr.com/rss' },
			{ label: translate( 'A blog:' ), instruction: '{ BLOG_NAME }.tumblr.com/rss' },
			{
				label: translate( 'Blog tag:' ),
				instruction: '{ BLOG_NAME }.tumblr.com/tagged/{ TAG_NAME }/rss',
			},
		],
	},
	[ 'substack' ]: {
		slug: 'substack',
		title: translate( 'Substack' ),
		url: `/${ BASE_URL }/substack`,
		pathname: '/reader/new/substack',
		source: 'reader-add-substack',
		placeholder: translate( 'Search by Substack URL' ),
		icon: <ReaderSubstackIcon iconSize={ 75 } />,
		instructionsTitle: translate( 'Common Substack URLs' ),
		instructions: [
			{
				label: translate( 'Publication feed:' ),
				instruction: 'https://{ PUBLICATION }.substack.com',
			},
			{ label: translate( 'Custom domain:' ), instruction: 'https://{ CUSTOM_DOMAIN }/feed' },
		],
	},
};
