import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getDiyBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 23575911,
		site_ID: 0,
		name: 'Make:',
		site_URL: 'https://makezine.com/',
		feed_URL: 'https://makezine.com/feed/',
		icon_URL: 'https://makezine.com/apple-touch-icon.png',
		description: __(
			'Maker projects, practical experiments, and ideas for building things yourself.'
		),
	},
	{
		feed_ID: 94842904,
		site_ID: 156670177,
		name: 'Hackaday',
		site_URL: 'https://hackaday.com/',
		feed_URL: 'https://hackaday.com/feed/',
		icon_URL:
			'https://hackaday.com/wp-content/themes/hackaday-2/img/hackaday-logo_1024x1024.png?v=3',
		description: __(
			'Creative hardware hacks, electronics projects, and clever engineering from the maker community.'
		),
	},
	{
		feed_ID: 35939321,
		site_ID: 0,
		name: 'Adafruit Blog',
		site_URL: 'https://blog.adafruit.com/',
		feed_URL: 'https://blog.adafruit.com/feed/',
		icon_URL: 'https://cdn-shop.adafruit.com/static/favicon-196x196.png',
		description: __(
			'Electronics tutorials, creative technology projects, and discoveries for makers.'
		),
	},
	{
		feed_ID: 11372418,
		site_ID: 0,
		name: 'Arduino Blog',
		site_URL: 'https://blog.arduino.cc/',
		feed_URL: 'https://blog.arduino.cc/feed/',
		icon_URL: 'https://blog.arduino.cc/favicon.ico',
		description: __(
			'Microcontroller projects, electronics ideas, and stories from the Arduino community.'
		),
	},
	{
		feed_ID: 63336872,
		site_ID: 0,
		name: 'A Beautiful Mess',
		site_URL: 'https://abeautifulmess.com/',
		feed_URL: 'https://abeautifulmess.com/feed/',
		icon_URL:
			'https://abeautifulmess.com/wp-content/uploads/2016/12/cropped-ABM-Favicon-200x200.jpg',
		description: __(
			'Colorful home projects, approachable crafts, and creative ideas for everyday life.'
		),
	},
	{
		feed_ID: 29862529,
		site_ID: 13563348,
		name: 'Flamingo Toes',
		site_URL: 'https://flamingotoes.com/',
		feed_URL: 'https://flamingotoes.com/feed/',
		icon_URL: 'https://flamingotoes.com/wp-content/uploads/2024/06/cropped-New-Favicon-180x180.jpg',
		description: __(
			'Sewing, quilting, embroidery, and creative projects mixing modern and vintage styles.'
		),
	},
	{
		feed_ID: 34915412,
		site_ID: 0,
		name: 'Thrifty Decor Chick',
		site_URL: 'https://www.thriftydecorchick.com/',
		feed_URL: 'https://www.thriftydecorchick.com/feeds/posts/default',
		icon_URL:
			'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhOyfXj6nhHhm531qeqsjpMwONp6Bz96aQVgy7oPt-YsbPNiAKhrdq3PoPBCjQSntT81I24MCJLhL_TiTvbyB2FkLCqhYVIWvupHD4KVhW4TUt32Q3fmGLmYcyLm5BPtd2mE2U0RlvrAeEr/s0-rw/this-chick---sarah.jpg',
		description: __(
			'Budget-conscious home improvements, decorating projects, and practical organization ideas.'
		),
	},
	{
		feed_ID: 183302466,
		site_ID: 0,
		name: 'DIY Candy',
		site_URL: 'https://diycandy.com/',
		feed_URL: 'https://diycandy.com/feed/',
		icon_URL: 'https://diycandy.b-cdn.net/wp-content/uploads/2024/06/Heart-Icon-375x375.png',
		description: __(
			'Easy craft tutorials, DIY home projects, and creative activities for all ages.'
		),
	},
	{
		feed_ID: 154196095,
		site_ID: 0,
		name: 'IKEA Hackers',
		site_URL: 'https://ikeahackers.net/',
		feed_URL: 'https://ikeahackers.net/feed/',
		icon_URL: 'https://ikeahackers.net/wp-content/uploads/2017/12/cropped-favicon-180x180.jpg',
		description: __( 'Creative ways to customize, adapt, and repurpose IKEA furniture.' ),
	},
	{
		feed_ID: 79617535,
		site_ID: 0,
		name: 'Apartment Therapy',
		site_URL: 'https://www.apartmenttherapy.com/',
		feed_URL: 'https://www.apartmenttherapy.com/main.rss',
		icon_URL: 'https://www.apartmenttherapy.com/static/icons/apple-touch-icon.png',
		description: __(
			'Practical home projects, decorating inspiration, and ideas for making the most of a space.'
		),
	},
	{
		feed_ID: 38872802,
		site_ID: 0,
		name: 'Houseful of Handmade',
		site_URL: 'https://housefulofhandmade.com/',
		feed_URL: 'https://housefulofhandmade.com/feed/',
		icon_URL:
			'https://housefulofhandmade.com/wp-content/uploads/2025/01/cropped-houseful-of-handmade-favicon-2025-180x180.png',
		description: __(
			'Woodworking plans, cabinet building, and practical projects for creating a home on a budget.'
		),
	},
	{
		feed_ID: 183303593,
		site_ID: 0,
		name: 'Paper and Stitch',
		site_URL: 'https://www.papernstitchblog.com/',
		feed_URL: 'https://www.papernstitchblog.com/feed/',
		icon_URL:
			'https://www.papernstitchblog.com/wp-content/uploads/2023/10/brittni-mehlhoff-paper-and-stitch-350x337.jpg',
		description: __(
			'Accessible craft projects, DIY home decor, and creative ideas for everyday living.'
		),
	},
];
