import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getFitnessBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 8958546,
		site_ID: 0,
		name: 'Nerd Fitness',
		site_URL: 'https://www.nerdfitness.com/blog/',
		feed_URL: 'https://www.nerdfitness.com/blog/feed/',
		icon_URL: 'https://www.nerdfitness.com/wp-content/uploads/2025/10/nf-icon-500-200x200.png',
		description: __( 'Approachable strength training, healthy habits, and fitness for beginners.' ),
	},
	{
		feed_ID: 68363948,
		site_ID: 0,
		name: 'DC Rainmaker',
		site_URL: 'https://www.dcrainmaker.com/',
		feed_URL: 'https://www.dcrainmaker.com/feed',
		icon_URL: 'https://media.dcrainmaker.com/images/2017/03/dcrainmaker-dc-logo-square.png',
		description: __( 'Detailed tests of sports watches, cycling devices, and fitness technology.' ),
	},
	{
		feed_ID: 9084757,
		site_ID: 0,
		name: 'Strength Running',
		site_URL: 'https://strengthrunning.com/',
		feed_URL: 'https://strengthrunning.com/feed/',
		icon_URL: 'https://strengthrunning.com/wp-content/uploads/2021/05/cropped-favicon-180x180.png',
		description: __(
			'Running training, injury prevention, and advice for becoming a stronger runner.'
		),
	},
	{
		feed_ID: 103414566,
		site_ID: 172711626,
		name: 'Marathon Handbook',
		site_URL: 'https://marathonhandbook.com/',
		feed_URL: 'https://marathonhandbook.com/feed/',
		icon_URL:
			'https://i0.wp.com/marathonhandbook.com/wp-content/uploads/cropped-favicon-180x180.png?resize=180%2C180&ssl=1',
		description: __( 'Running news, practical training guides, and advice for race day.' ),
	},
	{
		feed_ID: 18769192,
		site_ID: 0,
		name: 'Outside Online',
		site_URL: 'https://www.outsideonline.com/',
		feed_URL: 'https://www.outsideonline.com/feed/',
		icon_URL: 'https://cdn.outsideonline.com/wp-content/uploads/2021/07/favicon-194x194-1.png',
		description: __( 'Outdoor adventures, training ideas, and stories for an active life.' ),
	},
	{
		feed_ID: 88599588,
		site_ID: 0,
		name: 'Women’s Running',
		site_URL: 'https://www.womensrunning.com/',
		feed_URL: 'https://www.womensrunning.com/feed/',
		icon_URL:
			'https://cdn.womensrunning.com/wp-content/uploads/2022/09/cropped-favicon-180x180.png',
		description: __( 'Training, motivation, and stories from women in running.' ),
	},
	{
		feed_ID: 13895029,
		site_ID: 0,
		name: 'Eric Cressey',
		site_URL: 'https://ericcressey.com/',
		feed_URL: 'https://ericcressey.com/feed/',
		icon_URL: 'https://ericcressey.com/wp-content/uploads/2024/05/favicon.png',
		description: __(
			'Strength training, athletic performance, and coaching from a professional trainer.'
		),
	},
	{
		feed_ID: 105165825,
		site_ID: 172979821,
		name: 'Muscle & Fitness',
		site_URL: 'https://www.muscleandfitness.com/',
		feed_URL: 'https://www.muscleandfitness.com/feed/',
		icon_URL:
			'https://www.muscleandfitness.com/wp-content/themes/muscle-and-fitness/assets/build/images/favicon/favicon.ico',
		description: __( 'Strength workouts, athlete stories, and practical fitness coverage.' ),
	},
	{
		feed_ID: 95380952,
		site_ID: 0,
		name: 'Men’s Health',
		site_URL: 'https://www.menshealth.com/',
		feed_URL: 'https://www.menshealth.com/rss/all.xml/',
		icon_URL:
			'https://www.menshealth.com/_assets/design-tokens/menshealth/static/images/apple-touch-icon.35eef3d.png',
		description: __( 'Fitness routines, training ideas, and reporting on everyday well-being.' ),
	},
	{
		feed_ID: 9078883,
		site_ID: 0,
		name: 'iRunFar',
		site_URL: 'https://www.irunfar.com/',
		feed_URL: 'https://www.irunfar.com/feed',
		icon_URL: 'https://www.irunfar.com/favicon.ico',
		description: __(
			'Trail running, ultramarathon news, gear reviews, and training perspectives.'
		),
	},
	{
		feed_ID: 64148119,
		site_ID: 0,
		name: 'TrainingPeaks Blog',
		site_URL: 'https://www.trainingpeaks.com/blog/',
		feed_URL: 'https://www.trainingpeaks.com/feed/',
		icon_URL:
			'https://wpassets.trainingpeaks.com/wp-content/uploads/2025/03/31174958/cropped-favicon-180x180.png',
		description: __(
			'Endurance training, recovery, and coaching insights for runners and cyclists.'
		),
	},
	{
		feed_ID: 166312484,
		site_ID: 241137625,
		name: 'Run to the Finish',
		site_URL: 'https://runtothefinish.com/',
		feed_URL: 'https://runtothefinish.com/feed/',
		icon_URL:
			'https://runtothefinish.com/wp-content/uploads/2025/03/cropped-favicon_2025_dark.jpg?w=180',
		description: __( 'Running advice, training plans, and encouragement for everyday runners.' ),
	},
];
