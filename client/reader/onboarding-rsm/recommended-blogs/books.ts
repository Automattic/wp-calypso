import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getBooksBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 43737205,
		site_ID: 80495929,
		name: 'Literary Hub',
		site_URL: 'https://lithub.com/',
		feed_URL: 'https://lithub.com/feed/',
		icon_URL: 'https://s26162.pcdn.co/wp-content/uploads/2015/04/favicon.ico',
		description: __( 'Books, writers, criticism, and conversations from the literary world.' ),
	},
	{
		feed_ID: 7035360,
		site_ID: 0,
		name: 'The Paris Review',
		site_URL: 'https://www.theparisreview.org/blog/',
		feed_URL: 'https://www.theparisreview.org/blog/feed/',
		icon_URL:
			'https://www.theparisreview.org/blog/wp-content/uploads/2017/07/cropped-hadada-1-180x180.png',
		description: __(
			'Literary essays, interviews, and conversations about books, writing, and the arts.'
		),
	},
	{
		feed_ID: 26696970,
		site_ID: 28072387,
		name: 'Book Riot',
		site_URL: 'https://bookriot.com/',
		feed_URL: 'https://bookriot.com/feed/',
		icon_URL:
			'https://bookriot.com/wp-content/themes/bookriot/assets/images/favicons/BookRiot_Logo_180.png.webp',
		description: __(
			'Book recommendations, reading culture, and news from the world of publishing.'
		),
	},
	{
		feed_ID: 68435635,
		site_ID: 69066804,
		name: 'Electric Literature',
		site_URL: 'https://electricliterature.com/',
		feed_URL: 'https://electricliterature.com/feed/',
		icon_URL: 'https://electricliterature.com/wp-content/uploads/2019/02/favicon.jpeg',
		description: __( 'Literary essays, reading recommendations, and new voices in fiction.' ),
	},
	{
		feed_ID: 131408014,
		site_ID: 0,
		name: 'BookPage',
		site_URL: 'https://www.bookpage.com/',
		feed_URL: 'https://www.bookpage.com/feed/',
		icon_URL: 'https://t1.bookpage.com/wp-content/uploads/2021/07/19165527/BP-favicon-3.png',
		description: __( 'Book reviews, author interviews, and recommendations for your next read.' ),
	},
	{
		feed_ID: 35491448,
		site_ID: 0,
		name: 'The Guardian Books',
		site_URL: 'https://www.theguardian.com/books',
		feed_URL: 'https://www.theguardian.com/books/rss',
		icon_URL: 'https://assets.guim.co.uk/static/frontend/icons/homescreen/apple-touch-icon.svg',
		description: __( 'Book reviews, author interviews, and literary news.' ),
	},
	{
		feed_ID: 115190541,
		site_ID: 0,
		name: 'NPR Books',
		site_URL: 'https://www.npr.org/books/',
		feed_URL: 'https://feeds.npr.org/1032/rss.xml',
		icon_URL: 'https://media.npr.org/chrome/favicon/favicon-180x180.png',
		description: __( 'Author interviews, literary news, and book recommendations.' ),
	},
	{
		feed_ID: 61778918,
		site_ID: 0,
		name: 'Bookreporter',
		site_URL: 'https://www.bookreporter.com/',
		feed_URL: 'https://www.bookreporter.com/reviews/rss.xml',
		icon_URL: 'https://www.bookreporter.com/sites/all/themes/bookreporter/favicon.ico',
		description: __( 'Reviews, author interviews, and reading-group discoveries.' ),
	},
	{
		feed_ID: 34118996,
		site_ID: 47520297,
		name: "FictionFan's Book Reviews",
		site_URL: 'https://fictionfanblog.wordpress.com',
		feed_URL: 'https://fictionfanblog.wordpress.com/feed/',
		icon_URL:
			'https://fictionfanblog.wordpress.com/wp-content/uploads/2025/09/cropped-ff-favicon-2.jpg?w=180',
		description: __(
			'Book reviews and lively discussions across classic and contemporary fiction.'
		),
	},
	{
		feed_ID: 103970206,
		site_ID: 23261080,
		name: 'Pages Unbound',
		site_URL: 'https://pagesunbound.wordpress.com',
		feed_URL: 'https://pagesunbound.wordpress.com/feed/',
		icon_URL:
			'https://secure.gravatar.com/blavatar/71a80c1564aedb49a82dff856b113cdfb39431f40e652f285b8ec0a312a17e88?s=114',
		description: __( 'Thoughtful book reviews and conversations about reading and literature.' ),
	},
	{
		feed_ID: 103309695,
		site_ID: 0,
		name: 'Public Domain Review',
		site_URL: 'https://publicdomainreview.org/',
		feed_URL: 'https://publicdomainreview.org/rss.xml',
		icon_URL: 'https://publicdomainreview.org/apple-icon-180x180.png',
		description: __(
			'Explorations of historical art, literature, and curious works from the public domain.'
		),
	},
	{
		feed_ID: 26058,
		site_ID: 3521287,
		name: 'The Marginalian',
		site_URL: 'https://www.themarginalian.org/',
		feed_URL: 'https://www.themarginalian.org/feed/',
		icon_URL:
			'https://i0.wp.com/www.themarginalian.org/wp-content/uploads/2021/10/cropped-tm_site_icon-1.png?fit=180%2C180&ssl=1',
		description: __(
			'Essays connecting literature, art, science, philosophy, and the search for a meaningful life.'
		),
	},
];
