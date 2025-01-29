import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
import { RESULT_TOUR, RESULT_VIDEO } from './constants';

const debug = debugFactory( 'calypso:data-stores:contextual-help' );

export type LinksForSection = {
	readonly link: string;
	post_id?: number;
	readonly title: string;
	readonly description?: string;
	readonly intent?: string;
	icon?: string;
};

/*
source: https://www.youtube.com/playlist?list=PLQFhxUeNFfdKx9gO0a2mp9h8pKjb2y9la
run this in the console to get the videos into a more helpful format (also removes duplicates):
```JavaScript
data = {};
document.querySelectorAll('.yt-simple-endpoint.ytd-playlist-video-renderer').forEach( function( e ) {
	data[ new RegExp(/v=([^&]*)&/).exec( e.href )[1] ] = e.querySelector( '#video-title' ).innerHTML.trim();
} );
console.log( data );
```
*/

export const videosForSection = {
	sharing: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=YVelWG3hf3o',
			get title() {
				return __( 'Add Social Sharing Buttons to Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add social sharing buttons to your WordPress.com site, which you can also ' +
						'do with a Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=NcCe0ozmqFM',
			get title() {
				return __( 'Connect Your Blog to Facebook Using Jetpack Social', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to share blog posts directly on Facebook from your WordPress.com site, ' +
						'which you can also do on a Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=f44-4TgnWTs',
			get title() {
				return __( 'Display Your Instagram Feed on Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to display your latest Instagram photos right on your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3rTooGV_mlg',
			get title() {
				return __( 'Set Up the Social Links Menu', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to set up a social links menu on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=gmrOkkqMNlc',
			get title() {
				return __( 'Embed a Twitter Timeline in your Sidebar', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to display your Twitter timeline on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=vy-U5saqG9A',
			get title() {
				return __( 'Set Up a Social Media Icons Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to set up the social media icons widget on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=N0GRBFRkzzs',
			get title() {
				return __( 'Embed a Tweet from Twitter in Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to embed a Tweet in your content (including posts and pages) on your WordPress.com ' +
						'or Jetpack-enabled WordPress website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=uVRji6bKJUE',
			get title() {
				return __( 'Embed an Instagram Photo in Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to embed an Instagram photo in your content (including posts and pages) on your WordPress.com ' +
						'or Jetpack-enabled WordPress website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=sKm3Q83JxM0',
			get title() {
				return __( 'Embed a Facebook Update in Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to embed a Facebook update in your content (including posts, pages, and even comments) on your ' +
						'WordPress.com or Jetpack-enabled WordPress website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=SBgNkre_b14',
			get title() {
				return __( 'Share Blog Posts Directly on Twitter', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to share blog posts directly on Twitter from your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
	],
	settings: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=0YCZ22k4SfQ',
			get title() {
				return __( 'Add a Site Logo', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a custom logo to your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=vucZ1uZ2NPo',
			get title() {
				return __( 'Update Your Website Title and Tagline', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to update the Title and Tagline of your WordPress.com site, which you can also ' +
						'do on your Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Y6iPsPwYD7g',
			get title() {
				return __( 'Change Your Privacy Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your website privacy settings on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=bjxKGxW0MRA',
			get title() {
				return __( 'Add a Site Icon', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Find out how to add a site icon on WordPress.com.', __i18n_text_domain__ );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=z6fCtvLB0wM',
			get title() {
				return __( 'Create a Multilingual Site', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a multilingual site on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=D142Edhcpaw',
			get title() {
				return __( 'Customize Your Content Options', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to customize your content options on select WordPress.com themes.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Vyr-g5SEuIA',
			get title() {
				return __( 'Change Your Language Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your blog or website language and your interface language settings on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=EUuEuW_LCrc',
			get title() {
				return __( 'Activate Free Email Forwarding', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to activate free email forwarding from an address using a custom domain registered through WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
	],
	account: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=aO-6yu3_xWQ',
			get title() {
				return __( 'Change Your Password', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your account password on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=qhsjkqFdDZo',
			get title() {
				return __( 'Change Your WordPress.com Username', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Find out how to change your username on WordPress.com.', __i18n_text_domain__ );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Tyxu_xT6q1k',
			get title() {
				return __( 'Change Your WordPress.com Display Name', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your display name on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=07Nf8FkjO4o',
			get title() {
				return __( 'Change Your Account Email Address', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your account email address on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
	],
	customizer: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=pf_ST7gvY8c',
			get title() {
				return __( 'Add a Custom Header Image', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a custom header image to your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=CY20IAtl2Ac',
			get title() {
				return __( 'Create a Custom Website Menu', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a custom menu on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=2H_Jsgh2Z3Y',
			get title() {
				return __( 'Add a Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a widget to your WordPress.com website.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=ypFF4ONBfSQ',
			get title() {
				return __( 'Add a Custom Background', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a custom background to your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=b8EuJDrNeOA',
			get title() {
				return __( 'Change Your Site Fonts', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change the fonts on your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=7VPgvxV78Kc',
			get title() {
				return __( 'Add a Gallery Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add an image gallery widget to your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=oDBuaBLrwF8',
			get title() {
				return __( 'Use Featured Content', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to use the Featured Content option on your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3TqRr21zyiA',
			get title() {
				return __( 'Add an Image Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add an image widget to your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
	],
	'posts-pages': [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3RPidSCQ0LI',
			get title() {
				return __( 'Create a Landing Page', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a one-page website or landing page on your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=4IkFQzl5nXc',
			get title() {
				return __( 'Set Up a Website in 5 Steps', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a website on WordPress.com in five steps.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=mta6Y0o7yJk',
			get title() {
				return __( 'Set Up a Blog in 5 Steps', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a blog on WordPress.com in five steps.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Gx7YNX1Wk5U',
			get title() {
				return __( 'Create a Page', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a page on your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=mCfuh5bCOwM',
			get title() {
				return __( 'Create a Post', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Find out how to create a post on WordPress.com.', __i18n_text_domain__ );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=bEVHg6nopcs',
			get title() {
				return __( 'Use a Custom Menu in a Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to use a custom menu in a widget on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=nAzdUOlFoBI',
			get title() {
				return __( 'Configure a Static Homepage', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'By default, your new WordPress.com website displays your latest posts. Find out how to create a static homepage instead.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=MPpVeMmDOhk',
			get title() {
				return __( 'Show Related Posts on Your WordPress Blog', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to show related posts on your WordPress.com site, which you can also do on a Jetpack-enabled WordPress blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=JVnltCZUKC4',
			get title() {
				return __( 'Add Testimonials', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add testimonials to your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=yH_gapAUGAA',
			get title() {
				return __( 'Change Your Post or Page Visibility Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your page or post visibility settings WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
	],
	media: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=VjGnEHyqVqQ',
			get title() {
				return __( 'Add a Photo Gallery', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a photo gallery on your WordPress.com and Jetpack-enabled website.',
					__i18n_text_domain__
				);
			},
		},
	],
	themes: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=yOfAuOb68Hc',
			get title() {
				return __( 'Change Your Website Theme on WordPress.com', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Find out how to change your WordPress.com theme.', __i18n_text_domain__ );
			},
		},
	],
};

export const toursForSection = {
	media: [
		{
			type: RESULT_TOUR,
			tour: 'mediaBasicsTour',
			key: 'tour:mediaBasicsTour',
			get title() {
				return __( 'Learn Media Library Basics', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The Media Library is a useful tool to help you manage, search, and edit your photos, videos, documents, and other media.',
					__i18n_text_domain__
				);
			},
		},
	],
};

type SectionForVideos = keyof typeof videosForSection;
type SectionForTours = keyof typeof toursForSection & 'posts';
type SectionForPostsAndPages = 'posts' | 'pages';

export type Section = SectionForVideos | SectionForTours | SectionForPostsAndPages;

export function getContextResults( section: string, siteIntent: string ) {
	// Posts and Pages have a common help section
	if ( section === 'posts' || section === 'pages' ) {
		section = 'posts-pages';
	}

	if ( siteIntent ) {
		debug( `Site intent: ${ siteIntent }` );
	}

	// make sure editorially to show at most one tour and one video at once
	// `first` is a safe-guard in case that fails
	const video = videosForSection[ section as SectionForVideos ]?.[ 0 ];
	const tour = toursForSection[ section as SectionForTours ]?.[ 0 ];

	return [ tour, video ].filter( Boolean );
}
