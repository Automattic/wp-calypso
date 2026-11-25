import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getRelationshipsBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 43023687,
		site_ID: 0,
		name: 'The Gottman Institute',
		site_URL: 'https://www.gottman.com/blog/',
		feed_URL: 'https://www.gottman.com/blog/feed/',
		icon_URL: 'https://www.gottman.com/wp-content/uploads/2024/01/g_icon_two_tone-300x300.png',
		description: __(
			'Research-informed ideas for communication, intimacy, and lasting relationships.'
		),
	},
	{
		feed_ID: 33058699,
		site_ID: 39140838,
		name: 'GoodTherapy',
		site_URL: 'https://www.goodtherapy.org/blog/',
		feed_URL: 'https://www.goodtherapy.org/blog/feed/',
		icon_URL:
			'https://www.goodtherapy.org/blog/blog/wp-content/uploads/2025/08/cropped-GT-Logo-icon-192x192.png',
		description: __(
			'Therapist perspectives on relationships, emotional health, and everyday challenges.'
		),
	},
	{
		feed_ID: 102154700,
		site_ID: 160159144,
		name: 'The Couples Institute',
		site_URL: 'https://www.couplesinstitute.com/',
		feed_URL: 'https://www.couplesinstitute.com/feed/',
		icon_URL:
			'https://cdn-ilbdenb.nitrocdn.com/CxIcszBrBjgQMraBmjdKgSZsixKYWukZ/assets/images/optimized/rev-424a9f6/couples-institute-media.s3.amazonaws.com/wp-content/uploads/2022/03/fav-ci.png',
		description: __(
			'Ideas for understanding relationship patterns and communicating as a couple.'
		),
	},
	{
		feed_ID: 36737163,
		site_ID: 0,
		name: 'Growing Self',
		site_URL: 'https://www.growingself.com/',
		feed_URL: 'https://www.growingself.com/feed/',
		icon_URL:
			'https://www.growingself.com/wp-content/uploads/2015/09/cropped-GrowingSelf-FavIcon1-192x192.png',
		description: __(
			'Counseling and coaching perspectives on relationships, communication, and personal growth.'
		),
	},
	{
		feed_ID: 54903619,
		site_ID: 116779444,
		name: 'Dr. NerdLove',
		site_URL: 'https://www.doctornerdlove.com/',
		feed_URL: 'https://www.doctornerdlove.com/feed/',
		icon_URL:
			'https://www.doctornerdlove.com/wp-content/uploads/2016/09/cropped-NerdLoveSqLogo_Color_Web-192x192.gif',
		description: __(
			'Advice on dating, confidence, communication, and building better relationships.'
		),
	},
	{
		feed_ID: 102263403,
		site_ID: 0,
		name: 'The Atlantic: Family',
		site_URL: 'https://www.theatlantic.com/family/',
		feed_URL: 'https://www.theatlantic.com/feed/channel/family/',
		icon_URL:
			'https://cdn.theatlantic.com/_next/static/images/apple-touch-icon-152x152-aafde20dd981a38fcd549b29b2b3b785.png',
		description: __(
			'Reporting and essays on family life, friendship, and how relationships change.'
		),
	},
	{
		feed_ID: 106609040,
		site_ID: 0,
		name: 'Psyche',
		site_URL: 'https://psyche.co/',
		feed_URL: 'https://psyche.co/feed',
		icon_URL: 'https://psyche.co/favicon.ico?favicon.0ejq7gj6wznu0.ico',
		description: __(
			'Psychology and philosophy for understanding ourselves and connecting with others.'
		),
	},
	{
		feed_ID: 26955507,
		site_ID: 17757590,
		name: 'The Good Men Project',
		site_URL: 'https://goodmenproject.com/',
		feed_URL: 'https://goodmenproject.com/feed/',
		icon_URL: 'https://goodmenproject.com/apple-touch-icon.png',
		description: __( 'Personal essays on relationships, identity, and modern life.' ),
	},
	{
		feed_ID: 101431482,
		site_ID: 0,
		name: 'Greater Good',
		site_URL: 'https://greatergood.berkeley.edu/',
		feed_URL: 'https://greatergood.berkeley.edu/site/rss',
		icon_URL: 'https://greatergood.berkeley.edu/apple-touch-icon.png?v=2',
		description: __(
			'Science-informed stories about kindness, connection, resilience, and a meaningful life.'
		),
	},
	{
		feed_ID: 81092150,
		site_ID: 0,
		name: 'Psychology Today',
		site_URL: 'https://www.psychologytoday.com/',
		feed_URL: 'https://www.psychologytoday.com/us/front/feed',
		icon_URL: 'https://cdn2.psychologytoday.com/theme-assets/touch-icons/apple-touch-icon.png',
		description: __(
			'Expert perspectives on relationships, emotions, and the habits that shape our lives.'
		),
	},
	{
		feed_ID: 17497209,
		site_ID: 0,
		name: 'Barking Up the Wrong Tree',
		site_URL: 'https://bakadesuyo.com/',
		feed_URL: 'https://bakadesuyo.com/feed/',
		icon_URL: 'https://bakadesuyo.com/wp-content/uploads/2012/10/cropped-bakalogo-180x180.png',
		description: __(
			'Research-informed reflections on happiness, relationships, and living well.'
		),
	},
	{
		feed_ID: 9008451,
		site_ID: 0,
		name: 'The Washington Post: Advice',
		site_URL: 'https://www.washingtonpost.com/advice/',
		feed_URL: 'https://feeds.washingtonpost.com/rss/lifestyle/advice',
		icon_URL: 'https://www.washingtonpost.com/apple-touch-icon.png',
		description: __(
			'Advice columns on family, friendship, relationships, and everyday social dilemmas.'
		),
	},
];
