import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getMoviesBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 49527558,
		site_ID: 112084106,
		name: 'IndieWire',
		site_URL: 'https://www.indiewire.com/',
		feed_URL: 'https://www.indiewire.com/feed/',
		icon_URL: 'https://www.indiewire.com/wp-content/uploads/2018/04/cropped-iw_favicon.png?w=180',
		description: __(
			'Film-industry reporting, festival coverage, interviews, and stories about independent cinema.'
		),
	},
	{
		feed_ID: 9058638,
		site_ID: 6090856,
		name: 'The Film Stage',
		site_URL: 'https://thefilmstage.com/',
		feed_URL: 'https://thefilmstage.com/feed/',
		icon_URL:
			'https://jaredmobarak.com/wp-content/uploads/2024/10/tfs-icon-1080px-white-840x840-1.png?w=840',
		description: __(
			'Film news, director interviews, festival discoveries, and thoughtful cinema coverage.'
		),
	},
	{
		feed_ID: 183302448,
		site_ID: 0,
		name: 'Variety Film',
		site_URL: 'https://variety.com/v/film/',
		feed_URL: 'https://variety.com/v/film/feed/',
		icon_URL:
			'https://variety.com/wp-content/themes/pmc-variety-2020/assets/app/icons/apple-touch-icon.png',
		description: __(
			'Film-industry reporting, festival news, interviews, and developments in the movie business.'
		),
	},
	{
		feed_ID: 183302449,
		site_ID: 0,
		name: 'The Hollywood Reporter Movies',
		site_URL: 'https://www.hollywoodreporter.com/c/movies/',
		feed_URL: 'https://www.hollywoodreporter.com/c/movies/feed/',
		icon_URL:
			'https://www.hollywoodreporter.com/wp-content/uploads/2026/05/thr-site-icon.png?w=180',
		description: __(
			'Movie-industry news, filmmaker interviews, reviews, and awards-season coverage.'
		),
	},
	{
		feed_ID: 9080002,
		site_ID: 0,
		name: 'Collider',
		site_URL: 'https://collider.com/',
		feed_URL: 'https://collider.com/feed/',
		icon_URL: 'https://collider.com/public/build/images/favicon-240x240.png',
		description: __(
			'Movie and television news, interviews, reviews, and entertainment discoveries.'
		),
	},
	{
		feed_ID: 24924316,
		site_ID: 0,
		name: 'FirstShowing.net',
		site_URL: 'https://www.firstshowing.net/',
		feed_URL: 'https://www.firstshowing.net/feed/',
		icon_URL: 'https://media2.firstshowing.net/firstshowing/img/apple-touch-icon.png',
		description: __(
			'Movie trailers, festival discoveries, release news, and stories about the theatrical experience.'
		),
	},
	{
		feed_ID: 49536148,
		site_ID: 0,
		name: 'Film Comment',
		site_URL: 'https://www.filmcomment.com/',
		feed_URL: 'https://www.filmcomment.com/feed/',
		icon_URL: 'https://www.filmcomment.com/apple-touch-icon.png',
		description: __(
			'Film criticism, director interviews, and conversations about cinema around the world.'
		),
	},
	{
		feed_ID: 108809481,
		site_ID: 179290149,
		name: 'Deadline',
		site_URL: 'https://deadline.com/',
		feed_URL: 'https://deadline.com/feed/',
		icon_URL:
			'https://deadline.com/wp-content/themes/pmc-deadline-2019/assets/app/icons/apple-touch-icon.png',
		description: __(
			'Film and entertainment-industry reporting covering studios, talent, festivals, and major releases.'
		),
	},
	{
		feed_ID: 183302455,
		site_ID: 0,
		name: 'Slant Magazine',
		site_URL: 'https://www.slantmagazine.com/',
		feed_URL: 'https://www.slantmagazine.com/feed/',
		icon_URL:
			'https://cdn.shortpixel.ai/spai/q_glossy+ret_img+to_auto/www.slantmagazine.com/apple-touch-icon.png',
		description: __(
			'Independent criticism of films, music, television, and contemporary screen culture.'
		),
	},
	{
		feed_ID: 26729085,
		site_ID: 0,
		name: 'MovieMaker',
		site_URL: 'https://www.moviemaker.com/',
		feed_URL: 'https://www.moviemaker.com/feed/',
		icon_URL:
			'https://www.moviemaker.com/cdn-cgi/image/quality=65%2Cgravity=auto%2Cmetadata=none%2Cformat=auto%2Conerror=redirect/wp-content/uploads/2023/01/cropped-MM_favicon-2-420x420.jpg',
		description: __(
			'Film interviews, reviews, and stories about the art and craft of making movies.'
		),
	},
	{
		feed_ID: 56545967,
		site_ID: 0,
		name: 'The Playlist',
		site_URL: 'https://theplaylist.net/',
		feed_URL: 'https://theplaylist.net/feed/',
		icon_URL:
			'https://cdn.theplaylist.net/wp-content/uploads/2016/04/14214807/cropped-cropped-media-47-1-180x180.png',
		description: __(
			'Film news, criticism, interviews, and conversations about new movies and the people making them.'
		),
	},
	{
		feed_ID: 64647908,
		site_ID: 0,
		name: 'ScreenAnarchy',
		site_URL: 'https://screenanarchy.com/',
		feed_URL: 'http://feeds.screenanarchy.com/sa-everything',
		icon_URL:
			'https://cdn.bsky.app/img/avatar/plain/did:plc:qiappyfaauj6zd5y4t43ll5y/bafkreihcxlsgcdfzlgrvuojp73abi2wjh3yxh4ob26lev6v47kv5kwm7w4',
		description: __(
			'Independent and international film discoveries, festival reports, reviews, and interviews.'
		),
	},
];
