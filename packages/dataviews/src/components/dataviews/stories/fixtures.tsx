/**
 * WordPress dependencies
 */
import { trash, image, Icon, category } from '@wordpress/icons';
import {
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { Field, Action } from '../../../types';

export type Theme = {
	slug: string;
	name: string;
	description: string;
	requires: string;
	tested: string;
	tags: string[];
};

export type SpaceObject = {
	id: number;
	title: string;
	description: string;
	image: string;
	type: string;
	categories: string[];
	satellites: number;
	date: string;
};

export const data: SpaceObject[] = [
	{
		id: 1,
		title: 'Apollo',
		description: 'Apollo description',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Not a planet',
		categories: [ 'Space', 'NASA' ],
		satellites: 0,
		date: '2021-01-01T00:00:00Z',
	},
	{
		id: 2,
		title: 'Space',
		description: 'Space description',
		image: 'https://live.staticflickr.com/5678/21911065441_92e2d44708_b.jpg',
		type: 'Not a planet',
		categories: [ 'Space' ],
		satellites: 0,
		date: '2019-01-02T00:00:00Z',
	},
	{
		id: 3,
		title: 'NASA',
		description: 'NASA photo',
		image: 'https://live.staticflickr.com/742/21712365770_8f70a2c91e_b.jpg',
		type: 'Not a planet',
		categories: [ 'NASA' ],
		satellites: 0,
		date: '2025-01-03T00:00:00Z',
	},
	{
		id: 4,
		title: 'Neptune',
		description: 'Neptune description',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Ice giant',
		categories: [ 'Space', 'Planet', 'Solar system' ],
		satellites: 14,
		date: '2020-01-01T00:00:00Z',
	},
	{
		id: 5,
		title: 'Mercury',
		description: 'Mercury description',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Terrestrial',
		categories: [ 'Space', 'Planet', 'Solar system' ],
		satellites: 0,
		date: '2020-01-02T01:00:00Z',
	},
	{
		id: 6,
		title: 'Venus',
		description: 'La planète Vénus',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Terrestrial',
		categories: [ 'Space', 'Planet', 'Solar system' ],
		satellites: 0,
		date: '2020-01-02T00:00:00Z',
	},
	{
		id: 7,
		title: 'Earth',
		description: 'Earth description',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Terrestrial',
		categories: [ 'Space', 'Planet', 'Solar system' ],
		satellites: 1,
		date: '2023-01-03T00:00:00Z',
	},
	{
		id: 8,
		title: 'Mars',
		description: 'Mars description',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Terrestrial',
		categories: [ 'Space', 'Planet', 'Solar system' ],
		satellites: 2,
		date: '2020-01-01T00:00:00Z',
	},
	{
		id: 9,
		title: 'Jupiter',
		description: 'Jupiter description',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Gas giant',
		categories: [ 'Space', 'Planet', 'Solar system' ],
		satellites: 95,
		date: '2017-01-01T00:01:00Z',
	},
	{
		id: 10,
		title: 'Saturn',
		description: 'Saturn description',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Gas giant',
		categories: [ 'Space', 'Planet', 'Solar system' ],
		satellites: 146,
		date: '2020-02-01T00:02:00Z',
	},
	{
		id: 11,
		title: 'Uranus',
		description: 'Uranus description',
		image: 'https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg',
		type: 'Ice giant',
		categories: [ 'Space', 'Ice giant', 'Solar system' ],
		satellites: 28,
		date: '2020-03-01T00:00:00Z',
	},
];

export const themeData: Theme[] = [
	{
		slug: 'twentyeleven',
		name: 'Twenty Eleven',
		description:
			'The 2011 theme for WordPress is sophisticated, lightweight, and adaptable. Make it yours with a custom menu, header image, and background -- then go further with available theme options for light or dark color scheme, custom link colors, and three layout choices. Twenty Eleven comes equipped with a Showcase page template that transforms your front page into a showcase to show off your best content, widget support galore (sidebar, three footer areas, and a Showcase page widget area), and a custom "Ephemera" widget to display your Aside, Link, Quote, or Status posts. Included are styles for print and for the admin editor, support for featured images (as custom header images on posts and pages and as large images on featured "sticky" posts), and special styles for six different post formats.',
		requires: '3.2',
		tested: '6.6',
		tags: [
			'blog',
			'one-column',
			'two-columns',
			'left-sidebar',
			'right-sidebar',
			'custom-background',
			'custom-colors',
			'custom-header',
			'custom-menu',
			'editor-style',
			'featured-image-header',
			'featured-images',
			'flexible-header',
			'footer-widgets',
			'full-width-template',
			'microformats',
			'post-formats',
			'rtl-language-support',
			'sticky-post',
			'theme-options',
			'translation-ready',
			'block-patterns',
		],
	},
	{
		slug: 'twentyfifteen',
		name: 'Twenty Fifteen',
		description:
			"Our 2015 default theme is clean, blog-focused, and designed for clarity. Twenty Fifteen's simple, straightforward typography is readable on a wide variety of screen sizes, and suitable for multiple languages. We designed it using a mobile-first approach, meaning your content takes center-stage, regardless of whether your visitors arrive by smartphone, tablet, laptop, or desktop computer.",
		requires: '4.1',
		tested: '6.6',
		tags: [
			'blog',
			'two-columns',
			'left-sidebar',
			'accessibility-ready',
			'custom-background',
			'custom-colors',
			'custom-header',
			'custom-logo',
			'custom-menu',
			'editor-style',
			'featured-images',
			'microformats',
			'post-formats',
			'rtl-language-support',
			'sticky-post',
			'threaded-comments',
			'translation-ready',
			'block-patterns',
		],
	},
	{
		slug: 'twentyfourteen',
		name: 'Twenty Fourteen',
		description:
			"In 2014, our default theme lets you create a responsive magazine website with a sleek, modern design. Feature your favorite homepage content in either a grid or a slider. Use the three widget areas to customize your website, and change your content's layout with a full-width page template and a contributor page to show off your authors. Creating a magazine website with WordPress has never been easier.",
		requires: '3.6',
		tested: '6.6',
		tags: [
			'blog',
			'news',
			'two-columns',
			'three-columns',
			'left-sidebar',
			'right-sidebar',
			'custom-background',
			'custom-header',
			'custom-menu',
			'editor-style',
			'featured-images',
			'flexible-header',
			'footer-widgets',
			'full-width-template',
			'microformats',
			'post-formats',
			'rtl-language-support',
			'sticky-post',
			'theme-options',
			'translation-ready',
			'accessibility-ready',
			'block-patterns',
		],
	},
	{
		slug: 'twentynineteen',
		name: 'Twenty Nineteen',
		description:
			"Our 2019 default theme is designed to show off the power of the block editor. It features custom styles for all the default blocks, and is built so that what you see in the editor looks like what you'll see on your website. Twenty Nineteen is designed to be adaptable to a wide range of websites, whether you’re running a photo blog, launching a new business, or supporting a non-profit. Featuring ample whitespace and modern sans-serif headlines paired with classic serif body text, it's built to be beautiful on all screen sizes.",
		requires: '4.7',
		tested: '6.6',
		tags: [
			'one-column',
			'accessibility-ready',
			'custom-colors',
			'custom-menu',
			'custom-logo',
			'editor-style',
			'featured-images',
			'footer-widgets',
			'rtl-language-support',
			'sticky-post',
			'threaded-comments',
			'translation-ready',
			'block-patterns',
		],
	},
	{
		slug: 'twentyseventeen',
		name: 'Twenty Seventeen',
		description:
			'Twenty Seventeen brings your site to life with header video and immersive featured images. With a focus on business sites, it features multiple sections on the front page as well as widgets, navigation and social menus, a logo, and more. Personalize its asymmetrical grid with a custom color scheme and showcase your multimedia content with post formats. Our default theme for 2017 works great in many languages, for any abilities, and on any device.',
		requires: '4.7',
		tested: '6.6',
		tags: [
			'one-column',
			'two-columns',
			'right-sidebar',
			'flexible-header',
			'accessibility-ready',
			'custom-colors',
			'custom-header',
			'custom-menu',
			'custom-logo',
			'editor-style',
			'featured-images',
			'footer-widgets',
			'post-formats',
			'rtl-language-support',
			'sticky-post',
			'theme-options',
			'threaded-comments',
			'translation-ready',
			'block-patterns',
		],
	},
	{
		slug: 'twentysixteen',
		name: 'Twenty Sixteen',
		description:
			'Twenty Sixteen is a modernized take on an ever-popular WordPress layout — the horizontal masthead with an optional right sidebar that works perfectly for blogs and websites. It has custom color options with beautiful default color schemes, a harmonious fluid grid using a mobile-first approach, and impeccable polish in every detail. Twenty Sixteen will make your WordPress look beautiful everywhere.',
		requires: '4.4',
		tested: '6.6',
		tags: [
			'one-column',
			'two-columns',
			'right-sidebar',
			'accessibility-ready',
			'custom-background',
			'custom-colors',
			'custom-header',
			'custom-menu',
			'editor-style',
			'featured-images',
			'flexible-header',
			'microformats',
			'post-formats',
			'rtl-language-support',
			'sticky-post',
			'threaded-comments',
			'translation-ready',
			'blog',
			'block-patterns',
		],
	},
	{
		slug: 'twentyten',
		name: 'Twenty Ten',
		description:
			'The 2010 theme for WordPress is stylish, customizable, simple, and readable -- make it yours with a custom menu, header image, and background. Twenty Ten supports six widgetized areas (two in the sidebar, four in the footer) and featured images (thumbnails for gallery posts and custom header images for posts and pages). It includes stylesheets for print and the admin Visual Editor, special styles for posts in the "Asides" and "Gallery" categories, and has an optional one-column page template that removes the sidebar.',
		requires: '5.6',
		tested: '6.6',
		tags: [
			'blog',
			'two-columns',
			'custom-header',
			'custom-background',
			'threaded-comments',
			'sticky-post',
			'translation-ready',
			'microformats',
			'rtl-language-support',
			'editor-style',
			'custom-menu',
			'flexible-header',
			'featured-images',
			'footer-widgets',
			'featured-image-header',
			'block-patterns',
		],
	},
	{
		slug: 'twentythirteen',
		name: 'Twenty Thirteen',
		description:
			'The 2013 theme for WordPress takes us back to the blog, featuring a full range of post formats, each displayed beautifully in their own unique way. Design details abound, starting with a vibrant color scheme and matching header images, beautiful typography and icons, and a flexible layout that looks great on any device, big or small.',
		requires: '3.6',
		tested: '6.6',
		tags: [
			'blog',
			'one-column',
			'two-columns',
			'right-sidebar',
			'custom-header',
			'custom-menu',
			'editor-style',
			'featured-images',
			'footer-widgets',
			'microformats',
			'post-formats',
			'rtl-language-support',
			'sticky-post',
			'translation-ready',
			'accessibility-ready',
			'block-patterns',
		],
	},
	{
		slug: 'twentytwelve',
		name: 'Twenty Twelve',
		description:
			'The 2012 theme for WordPress is a fully responsive theme that looks great on any device. Features include a front page template with its own widgets, an optional display font, styling for post formats on both index and single views, and an optional no-sidebar page template. Make it yours with a custom menu, header image, and background.',
		requires: '3.5',
		tested: '6.6',
		tags: [
			'blog',
			'one-column',
			'two-columns',
			'right-sidebar',
			'custom-background',
			'custom-header',
			'custom-menu',
			'editor-style',
			'featured-images',
			'flexible-header',
			'footer-widgets',
			'full-width-template',
			'microformats',
			'post-formats',
			'rtl-language-support',
			'sticky-post',
			'theme-options',
			'translation-ready',
			'block-patterns',
		],
	},
	{
		slug: 'twentytwenty',
		name: 'Twenty Twenty',
		description:
			'Our default theme for 2020 is designed to take full advantage of the flexibility of the block editor. Organizations and businesses have the ability to create dynamic landing pages with endless layouts using the group and column blocks. The centered content column and fine-tuned typography also makes it perfect for traditional blogs. Complete editor styles give you a good idea of what your content will look like, even before you publish. You can give your site a personal touch by changing the background colors and the accent color in the Customizer. The colors of all elements on your site are automatically calculated based on the colors you pick, ensuring a high, accessible color contrast for your visitors.',
		requires: '4.7',
		tested: '6.6',
		tags: [
			'blog',
			'one-column',
			'custom-background',
			'custom-colors',
			'custom-logo',
			'custom-menu',
			'editor-style',
			'featured-images',
			'footer-widgets',
			'full-width-template',
			'rtl-language-support',
			'sticky-post',
			'theme-options',
			'threaded-comments',
			'translation-ready',
			'block-patterns',
			'block-styles',
			'wide-blocks',
			'accessibility-ready',
		],
	},
	{
		slug: 'twentytwentyfour',
		name: 'Twenty Twenty-Four',
		description:
			'Twenty Twenty-Four is designed to be flexible, versatile and applicable to any website. Its collection of templates and patterns tailor to different needs, such as presenting a business, blogging and writing or showcasing work. A multitude of possibilities open up with just a few adjustments to color and typography. Twenty Twenty-Four comes with style variations and full page designs to help speed up the site building process, is fully compatible with the site editor, and takes advantage of new design tools introduced in WordPress 6.4.',
		requires: '6.4',
		tested: '6.6',
		tags: [
			'one-column',
			'custom-colors',
			'custom-menu',
			'custom-logo',
			'editor-style',
			'featured-images',
			'full-site-editing',
			'block-patterns',
			'rtl-language-support',
			'sticky-post',
			'threaded-comments',
			'translation-ready',
			'wide-blocks',
			'block-styles',
			'style-variations',
			'accessibility-ready',
			'blog',
			'portfolio',
			'news',
		],
	},
	{
		slug: 'twentytwentyone',
		name: 'Twenty Twenty-One',
		description:
			'Twenty Twenty-One is a blank canvas for your ideas and it makes the block editor your best brush. With new block patterns, which allow you to create a beautiful layout in a matter of seconds, this theme’s soft colors and eye-catching — yet timeless — design will let your work shine. Take it for a spin! See how Twenty Twenty-One elevates your portfolio, business website, or personal blog.',
		requires: '5.3',
		tested: '6.6',
		tags: [
			'one-column',
			'accessibility-ready',
			'custom-colors',
			'custom-menu',
			'custom-logo',
			'editor-style',
			'featured-images',
			'footer-widgets',
			'block-patterns',
			'rtl-language-support',
			'sticky-post',
			'threaded-comments',
			'translation-ready',
			'blog',
			'portfolio',
		],
	},
	{
		slug: 'twentytwentythree',
		name: 'Twenty Twenty-Three',
		description:
			'Twenty Twenty-Three is designed to take advantage of the new design tools introduced in WordPress 6.1. With a clean, blank base as a starting point, this default theme includes ten diverse style variations created by members of the WordPress community. Whether you want to build a complex or incredibly simple website, you can do it quickly and intuitively through the bundled styles or dive into creation and full customization yourself.',
		requires: '6.1',
		tested: '6.6',
		tags: [
			'one-column',
			'custom-colors',
			'custom-menu',
			'custom-logo',
			'editor-style',
			'featured-images',
			'full-site-editing',
			'block-patterns',
			'rtl-language-support',
			'sticky-post',
			'threaded-comments',
			'translation-ready',
			'wide-blocks',
			'block-styles',
			'style-variations',
			'accessibility-ready',
			'blog',
			'portfolio',
			'news',
		],
	},
	{
		slug: 'twentytwentytwo',
		name: 'Twenty Twenty-Two',
		description:
			'Built on a solidly designed foundation, Twenty Twenty-Two embraces the idea that everyone deserves a truly unique website. The theme’s subtle styles are inspired by the diversity and versatility of birds: its typography is lightweight yet strong, its color palette is drawn from nature, and its layout elements sit gently on the page. The true richness of Twenty Twenty-Two lies in its opportunity for customization. The theme is built to take advantage of the Site Editor features introduced in WordPress 5.9, which means that colors, typography, and the layout of every single page on your site can be customized to suit your vision. It also includes dozens of block patterns, opening the door to a wide range of professionally designed layouts in just a few clicks. Whether you’re building a single-page website, a blog, a business website, or a portfolio, Twenty Twenty-Two will help you create a site that is uniquely yours.',
		requires: '5.9',
		tested: '6.6',
		tags: [
			'one-column',
			'custom-colors',
			'custom-menu',
			'custom-logo',
			'editor-style',
			'featured-images',
			'full-site-editing',
			'block-patterns',
			'rtl-language-support',
			'sticky-post',
			'threaded-comments',
			'style-variations',
			'wide-blocks',
			'block-styles',
			'accessibility-ready',
			'blog',
			'portfolio',
			'news',
		],
	},
];

export const themeFields: Field< Theme >[] = [
	{ id: 'slug', label: 'Slug' },
	{ id: 'name', label: 'Name' },
	{
		id: 'description',
		label: 'Description',
		render: ( { item } ) => (
			<span className="theme-field-description">
				{ item.description }
			</span>
		),
	},
	{ id: 'requires', label: 'Requires at least' },
	{ id: 'tested', label: 'Tested up to' },
	{ id: 'icon', label: 'Icon', render: () => <Icon icon={ image } /> },
	{
		id: 'tags',
		label: 'Tags',
		render: ( { item } ) => item.tags.join( ', ' ),
	},
];

export const DEFAULT_VIEW = {
	type: 'table' as const,
	search: '',
	page: 1,
	perPage: 10,
	layout: {},
	filters: [],
};

export const actions: Action< SpaceObject >[] = [
	{
		id: 'delete',
		label: 'Delete item',
		isPrimary: true,
		icon: trash,
		hideModalHeader: true,
		RenderModal: ( { items, closeModal } ) => {
			return (
				<VStack spacing="5">
					<Text>
						{ `Are you sure you want to delete "${ items[ 0 ].title }"?` }
					</Text>
					<HStack justify="right">
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							onClick={ closeModal }
						>
							Cancel
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ closeModal }
						>
							Delete
						</Button>
					</HStack>
				</VStack>
			);
		},
	},
	{
		id: 'secondary',
		label: 'Secondary action',
		callback() {},
	},
];

export const fields: Field< SpaceObject >[] = [
	{
		label: 'Image',
		id: 'image',
		header: (
			<HStack spacing={ 1 } justify="start">
				<Icon icon={ image } />
				<span>Image</span>
			</HStack>
		),
		render: ( { item } ) => {
			return (
				<img src={ item.image } alt="" style={ { width: '100%' } } />
			);
		},
		enableSorting: false,
	},
	{
		label: 'Title',
		id: 'title',
		enableHiding: false,
		enableGlobalSearch: true,
	},
	{
		id: 'date',
		label: 'Date',
		type: 'datetime',
	},
	{
		label: 'Type',
		id: 'type',
		enableHiding: false,
		elements: [
			{ value: 'Not a planet', label: 'Not a planet' },
			{ value: 'Ice giant', label: 'Ice giant' },
			{ value: 'Terrestrial', label: 'Terrestrial' },
			{ value: 'Gas giant', label: 'Gas giant' },
		],
	},
	{
		label: 'Satellites',
		id: 'satellites',
		type: 'integer',
		enableSorting: true,
	},
	{
		label: 'Description',
		id: 'description',
		enableSorting: false,
		enableGlobalSearch: true,
	},
	{
		label: 'Categories',
		id: 'categories',
		header: (
			<HStack spacing={ 1 } justify="start">
				<Icon icon={ category } />
				<span>Categories</span>
			</HStack>
		),
		elements: [
			{ value: 'Space', label: 'Space' },
			{ value: 'NASA', label: 'NASA' },
			{ value: 'Planet', label: 'Planet' },
			{ value: 'Solar system', label: 'Solar system' },
			{ value: 'Ice giant', label: 'Ice giant' },
		],
		filterBy: {
			operators: [ 'isAny', 'isNone', 'isAll', 'isNotAll' ],
		},
		getValue: ( { item } ) => {
			return item.categories;
		},
		render: ( { item } ) => {
			return item.categories.join( ',' );
		},
		enableSorting: false,
	},
];
