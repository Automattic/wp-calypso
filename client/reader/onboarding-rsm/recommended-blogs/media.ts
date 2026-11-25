import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getMediaBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 8913052,
		site_ID: 0,
		name: 'Poynter',
		site_URL: 'https://www.poynter.org/',
		feed_URL: 'https://www.poynter.org/feed/',
		icon_URL: 'https://www.poynter.org/wp-content/uploads/2020/06/favicon.png',
		description: __(
			'Reporting, ethics, and practical ideas for people who care about journalism.'
		),
	},
	{
		feed_ID: 83592105,
		site_ID: 0,
		name: 'Columbia Journalism Review',
		site_URL: 'https://www.cjr.org/',
		feed_URL: 'https://www.cjr.org/feed',
		icon_URL: 'https://www.cjr.org/wp-content/themes/cjr2026/_resources2015/img/favicon-152.png',
		description: __( 'Criticism and reporting on journalism, newsrooms, and the press.' ),
	},
	{
		feed_ID: 29374649,
		site_ID: 67503185,
		name: 'Awful Announcing',
		site_URL: 'https://awfulannouncing.com/',
		feed_URL: 'https://awfulannouncing.com/feed',
		icon_URL: 'https://cdn1.thecomeback.com/wp-content/uploads/sites/94/2024/07/180AAlogo.png',
		description: __(
			'Reporting and commentary on sports broadcasting, streaming, and the media business.'
		),
	},
	{
		feed_ID: 101607390,
		site_ID: 0,
		name: 'Global Voices Advox',
		site_URL: 'https://advox.globalvoices.org/',
		feed_URL: 'https://advox.globalvoices.org/feed/',
		icon_URL:
			'https://globalvoices.org/wp-content/gv-static/img/tmpl/gv-advocacy-apple-touch-icon-precomposed-300.png',
		description: __( 'Reporting on digital rights, online speech, and threats to expression.' ),
	},
	{
		feed_ID: 15231422,
		site_ID: 38341125,
		name: 'Digiday',
		site_URL: 'https://digiday.com/',
		feed_URL: 'https://digiday.com/feed/',
		icon_URL:
			'https://digiday.com/wp-content/themes/digiday/static/images/favicons/apple/apple-touch-icon-180x180.png',
		description: __(
			'Reporting on digital media, advertising, and the changing publishing business.'
		),
	},
	{
		feed_ID: 64107040,
		site_ID: 0,
		name: 'Adweek',
		site_URL: 'https://www.adweek.com/',
		feed_URL: 'https://www.adweek.com/feed/',
		icon_URL: 'https://static-www.adweek.com/wp-content/uploads/2025/03/cropped-image-6.png?w=180',
		description: __( 'News and analysis on advertising, brands, and the media industry.' ),
	},
	{
		feed_ID: 119236725,
		site_ID: 172726574,
		name: 'Committee to Protect Journalists',
		site_URL: 'https://cpj.org/',
		feed_URL: 'https://cpj.org/feed/',
		icon_URL: 'https://cpj.org/wp-content/themes/cpj/icons/apple-touch-icon.png',
		description: __(
			'Press freedom reporting and updates on journalists at risk around the world.'
		),
	},
	{
		feed_ID: 164650232,
		site_ID: 0,
		name: '404 Media',
		site_URL: 'https://www.404media.co/',
		feed_URL: 'https://www.404media.co/rss/',
		icon_URL:
			'https://storage.ghost.io/c/0f/76/0f76b548-bc58-4f25-abc3-3f5ebca07da4/content/images/size/w256h256/format/png/2023/08/favicon-3.svg',
		description: __(
			'Independent investigations into surveillance, cybersecurity, online communities, and the technology industry.'
		),
	},
	{
		feed_ID: 174662796,
		site_ID: 0,
		name: 'Platformer',
		site_URL: 'https://www.platformer.news/',
		feed_URL: 'https://www.platformer.news/rss/',
		icon_URL:
			'https://storage.ghost.io/c/a0/4c/a04c7225-d919-4d78-9b7c-a3fdd071349b/content/images/size/w256h256/2024/05/Logomark_Blue_800px.png',
		description: __(
			'Reporting and analysis on social platforms and the power of technology companies.'
		),
	},
	{
		feed_ID: 35415202,
		site_ID: 0,
		name: 'The Journalist’s Resource',
		site_URL: 'https://journalistsresource.org/',
		feed_URL: 'https://journalistsresource.org/feed/',
		icon_URL:
			'https://journalistsresource.org/wp-content/uploads/2020/11/cropped-jr-favicon-180x180.png',
		description: __(
			'Research summaries and resources that help journalists cover complex stories.'
		),
	},
	{
		feed_ID: 8886606,
		site_ID: 0,
		name: 'Nieman Lab',
		site_URL: 'https://www.niemanlab.org/',
		feed_URL: 'https://www.niemanlab.org/feed/',
		icon_URL: 'https://nieman.harvard.edu/app/uploads/2023/12/cropped-NiemanFavicon-1-180x180.png',
		description: __( 'Ideas, experiments, and reporting on the future of journalism.' ),
	},
	{
		feed_ID: 99859464,
		site_ID: 166491629,
		name: 'American Press Institute',
		site_URL: 'https://americanpressinstitute.org/',
		feed_URL: 'https://americanpressinstitute.org/feed/',
		icon_URL: 'https://americanpressinstitute.org/wp-content/uploads/2023/09/apple-touch-icon.png',
		description: __( 'Research and practical guidance for stronger local news organizations.' ),
	},
];
