import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getSoftwareBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 85143697,
		site_ID: 147945108,
		name: 'Engineering at Meta',
		site_URL: 'https://engineering.fb.com/',
		feed_URL: 'https://code.fb.com/feed',
		icon_URL: 'https://engineering.fb.com/wp-content/themes/code-fb-com/favicon.ico',
		description: __(
			'Engineering stories about large-scale systems, developer tools, and infrastructure at Meta.'
		),
	},
	{
		feed_ID: 2600933,
		site_ID: 0,
		name: 'Martin Fowler',
		site_URL: 'https://martinfowler.com/',
		feed_URL: 'https://martinfowler.com/feed.atom',
		icon_URL: 'https://martinfowler.com/img/mf-cologne.jpg',
		description: __(
			'Software architecture, refactoring, and practical approaches to building maintainable systems.'
		),
	},
	{
		feed_ID: 135712978,
		site_ID: 0,
		name: 'Simon Willison',
		site_URL: 'https://simonwillison.net/',
		feed_URL: 'https://simonwillison.net/atom/everything/',
		icon_URL: 'https://avatars.githubusercontent.com/u/9599?v=4',
		description: __(
			'Programming experiments, open-source tools, data analysis, and practical work with AI systems.'
		),
	},
	{
		feed_ID: 159755392,
		site_ID: 0,
		name: 'The Pragmatic Engineer',
		site_URL: 'https://newsletter.pragmaticengineer.com/',
		feed_URL: 'https://newsletter.pragmaticengineer.com/feed',
		icon_URL:
			'https://substackcdn.com/image/fetch/$s_!iIpB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47d77fcc-2914-46a1-8d39-3a6e8758e0ad%2Fapple-touch-icon-180x180.png',
		description: __(
			'Software engineering and management insights from inside technology companies and startups.'
		),
	},
	{
		feed_ID: 94847710,
		site_ID: 0,
		name: 'The Old New Thing',
		site_URL: 'https://devblogs.microsoft.com/oldnewthing/',
		feed_URL: 'https://devblogs.microsoft.com/oldnewthing/feed/',
		icon_URL:
			'https://devblogs.microsoft.com/oldnewthing/wp-content/themes/devblogs-evo/images/favicon/apple-touch-icon-180.png?ver=1789493481',
		description: __(
			'Windows programming, software history, and explanations of surprising platform behavior.'
		),
	},
	{
		feed_ID: 33375014,
		site_ID: 0,
		name: 'Cloudflare Blog',
		site_URL: 'https://blog.cloudflare.com/',
		feed_URL: 'https://blog.cloudflare.com/rss/',
		icon_URL: 'https://blog.cloudflare.com/favicon.ico',
		description: __(
			'Technical explanations of networking, internet security, performance, and distributed systems.'
		),
	},
	{
		feed_ID: 183302387,
		site_ID: 0,
		name: 'GitHub Engineering',
		site_URL: 'https://github.blog/engineering/',
		feed_URL: 'https://github.blog/engineering/feed/',
		icon_URL:
			'https://github.blog/wp-content/uploads/2019/01/cropped-github-favicon-512.png?fit=180%2C180',
		description: __(
			'How GitHub builds and operates its developer platform and large-scale infrastructure.'
		),
	},
	{
		feed_ID: 95663930,
		site_ID: 0,
		name: 'Stack Overflow Blog',
		site_URL: 'https://stackoverflow.blog/',
		feed_URL: 'https://stackoverflow.blog/feed/',
		icon_URL: 'https://stackoverflow.blog/apple-touch-icon.png',
		description: __(
			'Developer conversations, programming culture, and stories about building software.'
		),
	},
	{
		feed_ID: 75886964,
		site_ID: 0,
		name: 'Smashing Magazine',
		site_URL: 'https://www.smashingmagazine.com/',
		feed_URL: 'https://www.smashingmagazine.com/feed/',
		icon_URL: 'https://www.smashingmagazine.com/images/favicon/apple-touch-icon.png',
		description: __(
			'Practical guides to front-end development, CSS, accessibility, and user experience.'
		),
	},
	{
		feed_ID: 112467517,
		site_ID: 0,
		name: 'Netflix TechBlog',
		site_URL: 'https://netflixtechblog.com/',
		feed_URL: 'https://netflixtechblog.com/feed',
		icon_URL: 'https://avatars.githubusercontent.com/u/913567?v=4',
		description: __(
			'Engineering deep dives into streaming, distributed systems, data, and developer tooling.'
		),
	},
	{
		feed_ID: 112094333,
		site_ID: 0,
		name: 'Josh W. Comeau',
		site_URL: 'https://www.joshwcomeau.com/',
		feed_URL: 'https://www.joshwcomeau.com/rss.xml',
		icon_URL: 'https://www.joshwcomeau.com/favicon.png',
		description: __(
			'Interactive explanations of CSS, React, animations, and the details of front-end development.'
		),
	},
	{
		feed_ID: 35634746,
		site_ID: 0,
		name: 'The New Stack',
		site_URL: 'https://thenewstack.io/',
		feed_URL: 'https://thenewstack.io/feed/',
		icon_URL: 'https://thenewstack.io/apple-touch-icon.png?v=20260605',
		description: __(
			'Reporting and analysis about cloud-native infrastructure, open source, and software development.'
		),
	},
];
