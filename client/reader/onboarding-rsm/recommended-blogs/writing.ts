import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getWritingBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 2839505,
		site_ID: 104140032,
		name: 'Jane Friedman',
		site_URL: 'https://janefriedman.com/',
		feed_URL: 'https://janefriedman.com/feed/',
		icon_URL:
			'https://janefriedman.com/wp-content/uploads/2014/12/Friedman-Icon-copy1-548f4b9d_site_icon-256x256.png',
		description: __( 'Advice on writing, publishing, and building a sustainable author career.' ),
	},
	{
		feed_ID: 23607694,
		site_ID: 5842622,
		name: 'The Creative Penn',
		site_URL: 'https://www.thecreativepenn.com/',
		feed_URL: 'https://www.thecreativepenn.com/feed/',
		icon_URL: 'https://www.thecreativepenn.com/wp-content/uploads/2021/04/favicon.jpeg',
		description: __(
			'Writing craft, independent publishing, and the business of being an author.'
		),
	},
	{
		feed_ID: 42167850,
		site_ID: 110406735,
		name: 'Anne R. Allen’s Blog',
		site_URL: 'https://annerallen.com/',
		feed_URL: 'https://annerallen.com/feed/',
		icon_URL:
			'https://annerallen.com/wp-content/uploads/2015/11/anne-r-allen-blog-with-ruth-harris-circle-picture.png',
		description: __( 'Practical writing and publishing advice for authors at every stage.' ),
	},
	{
		feed_ID: 182603544,
		site_ID: 200396907,
		name: 'Writer Beware',
		site_URL: 'https://writerbeware.blog/',
		feed_URL: 'https://writerbeware.blog/feed/',
		icon_URL: 'https://writerbeware.blog/wp-content/uploads/2022/02/cropped-wb-favicon-180x180.png',
		description: __(
			'Publishing industry watchdog reports and guidance on avoiding author scams.'
		),
	},
	{
		feed_ID: 69979353,
		site_ID: 130323808,
		name: 'Nathan Bransford',
		site_URL: 'https://blog.nathanbransford.com/',
		feed_URL: 'https://blog.nathanbransford.com/feed',
		icon_URL:
			'https://nathanbransford.com/wp-content/uploads/2017/06/cropped-icon-square-1-192x192.png',
		description: __(
			'Writing, editing, and publishing advice from an author and former literary agent.'
		),
	},
	{
		feed_ID: 504267,
		site_ID: 7418105,
		name: 'Terribleminds',
		site_URL: 'https://terribleminds.com/ramble/',
		feed_URL: 'https://terribleminds.com/ramble/feed/',
		icon_URL:
			'https://terribleminds.com/ramble/wp-content/uploads/2018/07/cropped-favicon-180x180.gif',
		description: __( 'Novelist Chuck Wendig on storytelling, creativity, and the writing life.' ),
	},
	{
		feed_ID: 61773138,
		site_ID: 124830452,
		name: 'Kristen Lamb',
		site_URL: 'https://authorkristenlamb.com/',
		feed_URL: 'https://authorkristenlamb.com/feed/',
		icon_URL:
			'https://authorkristenlamb.com/wp-content/uploads/2019/06/cropped-favicon-sheep-2-180x180.jpg',
		description: __( 'Writing craft, author careers, and encouragement for creative work.' ),
	},
	{
		feed_ID: 75620348,
		site_ID: 0,
		name: 'Rachelle Gardner',
		site_URL: 'https://rachellegardner.com/',
		feed_URL: 'https://rachellegardner.com/feed/',
		icon_URL: 'https://rachellegardner.com/wp-content/uploads/2017/10/favico-300x300.png',
		description: __( 'A literary agent’s guidance on writing, publishing, and author careers.' ),
	},
	{
		feed_ID: 59403406,
		site_ID: 21793,
		name: 'John Scalzi’s Whatever',
		site_URL: 'https://whatever.scalzi.com/',
		feed_URL: 'https://whatever.scalzi.com/feed/',
		icon_URL:
			'https://i0.wp.com/whatever.scalzi.com/wp-content/uploads/2020/12/cropped-whateverfavicon.jpg?fit=180%2C180&ssl=1',
		description: __( 'Novelist John Scalzi on writing, books, culture, and the author’s life.' ),
	},
	{
		feed_ID: 79780304,
		site_ID: 0,
		name: 'Steven Pressfield',
		site_URL: 'https://stevenpressfield.com/',
		feed_URL: 'https://stevenpressfield.com/feed/',
		icon_URL:
			'https://stevenpressfield.com/wp-content/uploads/2021/02/cropped-iconfinder_spartan_1494445-2-180x180.png',
		description: __( 'Reflections on writing, creative discipline, and doing meaningful work.' ),
	},
	{
		feed_ID: 34084791,
		site_ID: 69549417,
		name: 'Writers in the Storm',
		site_URL: 'https://writersinthestormblog.com/',
		feed_URL: 'https://writersinthestormblog.com/feed/',
		icon_URL: 'https://writersinthestormblog.com/wp-content/uploads/2022/01/WITS-Logo-300x300.jpg',
		description: __(
			'Working writers share craft lessons, publishing advice, and creative encouragement.'
		),
	},
	{
		feed_ID: 8929970,
		site_ID: 0,
		name: 'Writer’s Digest',
		site_URL: 'https://www.writersdigest.com/',
		feed_URL: 'https://www.writersdigest.com/feed',
		icon_URL:
			'https://www.writersdigest.com/uploads/2025/02/writers-digest_favicon-512.png?auto=webp',
		description: __( 'Writing advice, publishing opportunities, and conversations with authors.' ),
	},
];
