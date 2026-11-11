import { translate } from 'i18n-calypso';
import ReaderSubstackIcon from 'calypso/reader/components/icons/substack-icon';
import ReaderTumblrIcon from 'calypso/reader/components/icons/tumblr-icon';
import ReaderYouTubeIcon from 'calypso/reader/components/icons/youtube-icon';
import type { JSX } from 'react';

export type SubscriptionType = 'add-new' | 'youtube' | 'tumblr' | 'substack';

interface AddSubscriptionFormConfig {
	slug: SubscriptionType;
	title: string;
	url: string;
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
	Object.freeze< Record< SubscriptionType, AddSubscriptionFormConfig > >( {
		[ 'add-new' ]: {
			slug: 'add-new',
			title: translate( 'Add new' ),
			url: `/${ BASE_URL }`,
			source: 'reader-add-new',
			placeholder: undefined,
		},
		[ 'youtube' ]: {
			slug: 'youtube',
			title: translate( 'YouTube' ),
			url: `/${ BASE_URL }/youtube`,
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
