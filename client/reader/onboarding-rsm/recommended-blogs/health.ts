import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getHealthBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 70047896,
		site_ID: 0,
		name: 'STAT',
		site_URL: 'https://www.statnews.com/',
		feed_URL: 'https://www.statnews.com/feed/',
		icon_URL:
			'https://www.statnews.com/wp-content/uploads/2023/06/cropped-STAT-Favicon-Round-192x192.png',
		description: __(
			'Independent reporting on medicine, public health, biotechnology, and the health-care industry.'
		),
	},
	{
		feed_ID: 141929311,
		site_ID: 0,
		name: 'KFF Health News',
		site_URL: 'https://kffhealthnews.org/',
		feed_URL: 'https://kffhealthnews.org/feed/',
		icon_URL:
			'https://kffhealthnews.org/wp-content/uploads/sites/8/2023/04/kffhealthnews-icon.png?w=192',
		description: __( 'In-depth journalism about health care, policy, costs, and access.' ),
	},
	{
		feed_ID: 142646387,
		site_ID: 0,
		name: 'Your Local Epidemiologist',
		site_URL: 'https://yourlocalepidemiologist.substack.com/',
		feed_URL: 'https://yourlocalepidemiologist.substack.com/feed',
		icon_URL:
			'https://substackcdn.com/image/fetch/$s_!XZ4r!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5199ac32-66f8-4f4e-bd4f-20a1fe23f389%2Fapple-touch-icon-1024x1024.png',
		description: __( 'An epidemiologist explains public-health research and changing evidence.' ),
	},
	{
		feed_ID: 126335779,
		site_ID: 0,
		name: 'Ground Truths (Eric Topol)',
		site_URL: 'https://erictopol.substack.com/',
		feed_URL: 'https://erictopol.substack.com/feed',
		icon_URL:
			'https://substackcdn.com/image/fetch/$s_!MlsU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F6f253bb6-e226-467e-a845-590ae4e55256%2Fapple-touch-icon-1024x1024.png',
		description: __(
			'Eric Topol examines biomedical research, medicine, and emerging health technologies.'
		),
	},
	{
		feed_ID: 15661550,
		site_ID: 6865009,
		name: 'Science-Based Medicine',
		site_URL: 'https://sciencebasedmedicine.org/',
		feed_URL: 'https://sciencebasedmedicine.org/feed/',
		icon_URL: 'https://sciencebasedmedicine.org/wp-content/uploads/2018/09/favicon.png',
		description: __(
			'Clinicians examine medical evidence, health claims, and the science behind treatment.'
		),
	},
	{
		feed_ID: 132767669,
		site_ID: 208984964,
		name: 'KevinMD',
		site_URL: 'https://www.kevinmd.com/',
		feed_URL: 'https://www.kevinmd.com/feed',
		icon_URL: 'https://kevinmd.com/wp-content/uploads/cropped-shutterstock_1572090931-192x192.jpg',
		description: __(
			'Physicians, health professionals, and patients share perspectives on health care.'
		),
	},
	{
		feed_ID: 155033836,
		site_ID: 229351620,
		name: 'The Incidental Economist',
		site_URL: 'https://theincidentaleconomist.com/',
		feed_URL: 'https://theincidentaleconomist.com/wordpress/feed/',
		icon_URL: 'https://theincidentaleconomist.com/android-icon-192x192.png',
		description: __( 'Researchers explain health economics, health services, and public policy.' ),
	},
	{
		feed_ID: 47410429,
		site_ID: 0,
		name: 'Dana-Farber Insights',
		site_URL: 'https://blog.dana-farber.org/insight/',
		feed_URL: 'https://blog.dana-farber.org/insight/feed/',
		icon_URL:
			'https://blog.dana-farber.org/insight/wp-content/uploads/2021/08/cropped-cropped-DFCI-Lens-512px-rgb-192x192.png',
		description: __(
			'Cancer research, treatment explainers, and patient stories from Dana-Farber.'
		),
	},
	{
		feed_ID: 138031957,
		site_ID: 70617574,
		name: 'Public Health Insider (Seattle-King County)',
		site_URL: 'https://publichealthinsider.com/',
		feed_URL: 'https://publichealthinsider.com/feed/',
		icon_URL:
			'https://i0.wp.com/publichealthinsider.com/wp-content/uploads/2020/04/favicon.png?fit=108%2C108&ssl=1',
		description: __(
			'Public-health news and practical information from Seattle and King County’s health department.'
		),
	},
	{
		feed_ID: 81092150,
		site_ID: 0,
		name: 'Psychology Today: Essential reads',
		site_URL: 'https://www.psychologytoday.com/',
		feed_URL: 'https://www.psychologytoday.com/us/front/feed',
		icon_URL: 'https://cdn2.psychologytoday.com/theme-assets/touch-icons/apple-touch-icon.png',
		description: __(
			'Research and expert perspectives on psychology, behavior, and mental health.'
		),
	},
	{
		feed_ID: 157233779,
		site_ID: 0,
		name: 'The Conversation: Health',
		site_URL: 'https://theconversation.com/us/health',
		feed_URL: 'https://theconversation.com/us/health/articles.atom',
		icon_URL:
			'https://images.theconversation.com/files/581997/original/9275d5c0-7dd5-4ddf-b50b-98d537e016f4.png',
		description: __( 'Academic experts explain health research and public-health questions.' ),
	},
	{
		feed_ID: 47680663,
		site_ID: 90357163,
		name: 'Precision Nutrition',
		site_URL: 'https://www.precisionnutrition.com/blog',
		feed_URL: 'https://www.precisionnutrition.com/feed',
		icon_URL:
			'https://assets.precisionnutrition.com/pn-wp/74f0945b/img/favicon/apple-touch-icon.png',
		description: __( 'Research-informed nutrition, fitness, and coaching perspectives.' ),
	},
];
