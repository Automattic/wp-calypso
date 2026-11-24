import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getEducationBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 19068123,
		site_ID: 64463434,
		name: "A Teacher's Reflections",
		site_URL: 'https://jenniefitzkee.com/',
		feed_URL: 'https://jenniefitzkee.com/feed/',
		icon_URL:
			'https://secure.gravatar.com/blavatar/12730c74093cf1e378346bf661889b54473f18d629c0698d1c354c77d4b856e6?s=114',
		description: __(
			'Classroom stories about early learning, picture books, art, and children’s curiosity.'
		),
	},
	{
		feed_ID: 69814417,
		site_ID: 96366428,
		name: 'TeacherToolkit',
		site_URL: 'https://www.teachertoolkit.co.uk/',
		feed_URL: 'http://www.teachertoolkit.co.uk/feed',
		icon_URL:
			'https://cdn.shortpixel.ai/spai/q_glossy+ret_img+to_webp/www.teachertoolkit.co.uk/wp-content/uploads/2018/09/cropped-teachertoolkit-logo-2lines-rgb-white-on-red-website-favicon-180x180.png',
		description: __(
			'Practical teaching ideas, classroom resources, and reflections on school leadership.'
		),
	},
	{
		feed_ID: 139072633,
		site_ID: 144578924,
		name: 'OECD Education and Skills Today',
		site_URL: 'https://oecdedutoday.com',
		feed_URL: 'https://oecdedutoday.com/feed/',
		icon_URL: 'https://oecdedutoday.com/wp-content/uploads/2019/04/cropped-OECD-logo-1-180x180.png',
		description: __(
			'International perspectives on education policy, schools, and lifelong learning.'
		),
	},
	{
		feed_ID: 156783746,
		site_ID: 87216431,
		name: 'Special Education and Inclusive Learning',
		site_URL: 'https://inclusiveteach.com',
		feed_URL: 'https://inclusiveteach.com/feed/',
		icon_URL:
			'https://i0.wp.com/inclusiveteach.com/wp-content/uploads/2019/04/cropped-img_1509-1.png?fit=180%2C156&ssl=1',
		description: __(
			'Inclusive teaching strategies, special education resources, and classroom reflections.'
		),
	},
	{
		feed_ID: 2477194,
		site_ID: 32729256,
		name: 'International Education News',
		site_URL: 'http://internationalednews.com',
		feed_URL: 'https://internationalednews.com/feed/',
		icon_URL:
			'https://internationalednews.com/wp-content/uploads/2024/02/cropped-screenshot-2024-02-21-at-9.05.31e280afam.png?w=180',
		description: __(
			'Research and reporting on teaching, schools, and education around the world.'
		),
	},
	{
		feed_ID: 78449659,
		site_ID: 0,
		name: 'Shake Up Learning',
		site_URL: 'http://www.shakeuplearning.com/',
		feed_URL: 'http://shakeuplearning.com/feed',
		icon_URL:
			'https://shakeuplearning.com/wp-content/uploads/2026/08/cropped-SHAKE-UP-LEARNING-Profile-Logo-8-180x180.png',
		description: __( 'Practical classroom technology ideas and resources for teachers.' ),
	},
	{
		feed_ID: 49096568,
		site_ID: 0,
		name: 'EdSurge',
		site_URL: 'https://www.edsurge.com/',
		feed_URL: 'https://www.edsurge.com/articles_rss',
		icon_URL: 'https://www.edsurge.com/favicon.ico?favicon.3f910c77.ico',
		description: __(
			'Reporting on education, learning technology, and the people shaping schools.'
		),
	},
	{
		feed_ID: 26394124,
		site_ID: 0,
		name: 'Cult of Pedagogy',
		site_URL: 'https://www.cultofpedagogy.com/',
		feed_URL: 'https://www.cultofpedagogy.com/feed/',
		icon_URL:
			'https://www.cultofpedagogy.com/wp-content/themes/cult-of-pedagogy/images/apple-touch-icon.png',
		description: __(
			'Practical teaching strategies, classroom ideas, and conversations with educators.'
		),
	},
	{
		feed_ID: 65895799,
		site_ID: 127617468,
		name: 'A Delectable Education Podcast',
		site_URL: 'https://www.adelectableeducation.com',
		feed_URL: 'http://www.adelectableeducation.com/feed',
		icon_URL:
			'https://i0.wp.com/www.adelectableeducation.com/wp-content/uploads/2023/11/cropped-FavIcon-1.png?fit=180%2C180&ssl=1',
		description: __( 'Conversations and practical guidance on Charlotte Mason home education.' ),
	},
	{
		feed_ID: 55601853,
		site_ID: 126626977,
		name: 'We Are Teachers',
		site_URL: 'https://www.weareteachers.com/',
		feed_URL: 'https://www.weareteachers.com/feed/',
		icon_URL: 'https://www.weareteachers.com/wp-content/uploads/WAT-small-FAVICON.png',
		description: __(
			'Classroom resources, teaching ideas, and stories from the school community.'
		),
	},
	{
		feed_ID: 104735987,
		site_ID: 138677242,
		name: 'The Hechinger Report',
		site_URL: 'https://hechingerreport.org/',
		feed_URL: 'https://hechingerreport.org/feed/',
		icon_URL:
			'https://i0.wp.com/hechingerreport.org/wp-content/uploads/2018/06/cropped-favicon.jpg?fit=180%2C180&ssl=1',
		description: __( 'Independent reporting on education quality, inequality, and innovation.' ),
	},
	{
		feed_ID: 2713736,
		site_ID: 0,
		name: 'Faculty Focus',
		site_URL: 'https://www.facultyfocus.com/',
		feed_URL: 'https://www.facultyfocus.com/feed/',
		icon_URL: 'https://s39613.pcdn.co/wp-content/uploads/2017/10/FFicon-25px-new.png',
		description: __(
			'Practical insights on college teaching, course design, and student learning.'
		),
	},
];
