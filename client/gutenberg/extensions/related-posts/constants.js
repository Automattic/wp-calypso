/** @format */

/**
 * Internal dependencies
 */
import imgCatBlog from 'assets/images/related-posts/cat-blog.png';
import imgDevices from 'assets/images/related-posts/devices.jpg';
import imgWedding from 'assets/images/related-posts/mobile-wedding.jpg';

export const MAX_POSTS_TO_SHOW = 3;
export const DEFAULT_POSTS = [
	{
		title: 'Big iPhone/iPad Update Now Available',
		img: {
			src: imgCatBlog,
		},
		date: 'August 3, 2018',
		context: 'In "Mobile"',
	},
	{
		title: 'The WordPress for Android App Gets a Big Facelift',
		img: {
			src: imgDevices,
		},
		date: 'August 2, 2018',
		context: 'In "Mobile"',
	},
	{
		title: 'Upgrade Focus: VideoPress For Weddings',
		img: {
			src: imgWedding,
		},
		date: 'August 5, 2018',
		context: 'In "Upgrade"',
	},
];
