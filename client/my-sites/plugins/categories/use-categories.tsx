import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Category } from '.';

export const ALLOWED_CATEGORIES = [
	'analytics',
	'booking',
	'customer',
	'design',
	'discover',
	'donations',
	'ecommerce',
	'education',
	'email',
	'events',
	'finance',
	'marketing',
	'photo',
	'posts',
	'security',
	'seo',
	'shipping',
	'social',
	'widgets',

	// "Top paid plugins", "Editors pick" etc aren't real categories but we
	// treat them like they are in the UI so include them here
	'popular',
	'featured',
	'paid',
	'monetization',
	'business',
	'onlinestore',
];

export const categories: Record< string, Category > = {
	discover: { name: __( 'Discover' ), slug: 'discover', tags: [], preview: [] },
	paid: {
		name: __( 'Must-have premium plugins' ),
		description: __( 'Add the best-loved plugins on WordPress.com' ),
		slug: 'paid',
		tags: [],
		preview: [],
	},
	popular: {
		name: __( 'The free essentials' ),
		description: __( 'Add and install the very best free plugins' ),
		slug: 'popular',
		tags: [],
		preview: [],
	},
	featured: {
		name: __( 'Our developers’ favorites' ),
		description: __( 'Start fast with these WordPress.com team picks' ),
		slug: 'featured',
		tags: [],
		preview: [],
	},
	seo: {
		name: __( 'Search Engine Optimization' ),
		description: __( 'Fine-tune your site’s content and metadata for search engine success.' ),
		icon: 'grid',
		slug: 'seo',
		tags: [ 'seo' ],
		preview: [],
	},
	ecommerce: {
		name: __( 'Ecommerce & Business' ),
		description: __( 'Tools that will set you up to optimize your online business' ),
		icon: 'grid',
		slug: 'ecommerce',
		tags: [ 'ecommerce', 'e-commerce', 'woocommerce', 'business', 'business-directory' ],
		preview: [],
	},
	booking: {
		name: __( 'Booking & Scheduling' ),
		description: __( 'Take bookings and manage your availability right from your site.' ),
		icon: 'grid',
		slug: 'booking',
		tags: [ 'booking', 'scheduling', 'appointment', 'reservation', 'booking-calendar' ],
		preview: [],
	},
	events: {
		name: __( 'Events Calendar' ),
		description: __( 'Build buzz and set the scene with an on-site events calendar.' ),
		icon: 'grid',
		slug: 'events',
		tags: [ 'events-calendar', 'calendar', 'calendar-event' ],
		preview: [],
	},
	social: {
		name: __( 'Social' ),
		description: __( 'Connect to your audience and amplify your content on social.' ),
		icon: 'grid',
		slug: 'social',
		tags: [ 'social', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'pinterest' ],
		preview: [],
	},
	email: {
		name: __( 'Email' ),
		description: __( 'Forge a direct connection with your readers through email.' ),
		icon: 'grid',
		slug: 'email',
		tags: [ 'email' ],
		preview: [],
	},
	security: {
		name: __( 'Security' ),
		description: __( 'Take advanced control of your site’s security.' ),
		icon: 'grid',
		slug: 'security',
		tags: [ 'security' ],
		preview: [],
	},
	finance: {
		name: __( 'Finance & Payments' ),
		description: __(
			'Sell products, subscriptions, and services while keeping on top of every transaction.'
		),
		icon: 'grid',
		slug: 'finance',
		tags: [ 'finance', 'payment', 'credit-card', 'payment-gateway' ],
		preview: [],
	},
	shipping: {
		name: __( 'Shipping & Delivery' ),
		description: __( 'Create a seamless shipping experience with advanced delivery integrations.' ),
		icon: 'grid',
		slug: 'shipping',
		tags: [
			'shipping',
			'usps',
			'woocommerce-shipping',
			'delivery',
			'shipment-tracking',
			'food-delivery',
			'food-pickup',
			'courier',
		],
		preview: [],
	},
	analytics: {
		name: __( 'Analytics' ),
		description: __( 'Go deeper and learn faster with site visitor and performance insights.' ),
		icon: 'grid',
		slug: 'analytics',
		tags: [ 'analytics' ],
		preview: [],
	},
	marketing: {
		name: __( 'Marketing' ),
		description: __( 'Bring in new business and shine a spotlight on your projects or products.' ),
		icon: 'grid',
		slug: 'marketing',
		tags: [ 'marketing' ],
		preview: [],
	},
	design: {
		name: __( 'Design' ),
		description: __( 'Finesse your site’s design with advanced customization tools.' ),
		icon: 'grid',
		slug: 'design',
		tags: [ 'design', 'blocks', 'editor' ],
		preview: [],
	},
	photo: {
		name: __( 'Photo & Video' ),
		description: __(
			'Create, share, edit, and manage beautiful images and video {with added precision and flexibility.'
		),
		icon: 'grid',
		slug: 'photo',
		tags: [ 'photo', 'video', 'media' ],
		preview: [],
	},
	customer: {
		name: __( 'CRM & Live Chat' ),
		description: __( 'Create stand-out customer service experiences for your site visitors.' ),
		icon: 'grid',
		slug: 'customer',
		tags: [ 'customer-service', 'live-chat', 'crm' ],
		preview: [],
	},
	donations: {
		name: __( 'Crowdfunding' ),
		description: __( 'Launch and run crowdfunding campaigns right from your site.' ),
		icon: 'grid',
		slug: 'donations',
		tags: [
			'donation',
			'donation-plugin',
			'donations',
			'donate',
			'fundraising',
			'crowdfunding',
			'recurring-donations',
			'charity',
		],
		preview: [],
	},
	education: {
		name: __( 'Learning Management Systems' ),
		description: __( 'Create, run, and manage interactive courses and learning experiences.' ),
		icon: 'grid',
		slug: 'education',
		tags: [ 'education', 'lms', 'learning-management-systems', 'elearning' ],
		preview: [],
	},
	widgets: {
		name: __( 'Widgets' ),
		description: __( 'Take widgets to the next level with advanced control and customization.' ),
		icon: 'grid',
		slug: 'widgets',
		tags: [ 'widgets' ],
		preview: [],
	},
	posts: {
		name: __( 'Posts & Posting' ),
		description: __( 'Unlock advanced content planning, publishing, and scheduling features.' ),
		icon: 'grid',
		slug: 'posts',
		tags: [ 'posts', 'post', 'page', 'pages' ],
		preview: [],
	},
	monetization: {
		name: __( 'Supercharging and monetizing your blog' ),
		slug: 'monetization',
		description: __( 'Building a money-making blog doesn’t have to be as hard as you might think' ),
		tags: [ 'affiliate-marketing', 'advertising', 'adwords' ],
		preview: [
			{
				slug: 'wordpress-seo-premium',
				name: __( 'Yoast SEO Premium' ),
				icon: 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
				short_description: __( 'Optimize your site for search engines' ),
			},
			{
				slug: 'give',
				name: __( 'GiveWP' ),
				icon: 'https://ps.w.org/give/assets/icon-256x256.jpg?rev=2659032',
				short_description: __( 'Create donation pages and collect more' ),
			},
			{
				slug: 'woothemes-sensei',
				name: __( 'Sensei Pro' ),
				icon: 'https://wordpress.com/wp-content/lib/marketplace-images/sensei-pro.svg',
				short_description: __( 'Manage and sell digital courses' ),
			},
		],
	},
	business: {
		name: __( 'Setting up your local business' ),
		slug: 'business',
		description: __( 'These plugins are here to keep your business on track' ),
		tags: [ 'google', 'testimonials', 'crm' ],
		preview: [
			{
				slug: 'wordpress-seo-premium',
				name: __( 'Yoast SEO Premium' ),
				icon: 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png',
				short_description: __( 'Optimize your site for search engines' ),
			},
			{
				slug: 'woocommerce-bookings',
				name: __( 'WooCommerce Bookings ' ),
				icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce-bookings.png',
				short_description: __( 'Allow customers to book appointments' ),
			},
			{
				slug: 'mailpoet',
				name: __( 'MailPoet' ),
				icon: 'https://ps.w.org/mailpoet/assets/icon-256x256.png?rev=2784430',
				short_description: __( 'Send emails and create loyal customers' ),
			},
		],
	},
	onlinestore: {
		name: __( 'Powering your online store' ),
		slug: 'onlinestore',
		description: __( 'Tools that will set you up to optimize your online business' ),
		tags: [ 'ecommerce', 'payments' ],
		preview: [
			{
				slug: 'woocommerce-subscriptions',
				name: __( 'WooCommerce Subscriptions' ),
				icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce-subscriptions.png',
				short_description: __( 'Let customers subscribe to your service' ),
			},
			{
				slug: 'woocommerce-xero',
				name: __( 'Xero' ),
				icon: 'https://woocommerce.com/wp-content/uploads/2012/08/xero2.png',
				short_description: __( 'Sync your site with your Xero account' ),
			},
			{
				slug: 'automatewoo',
				name: __( 'AutomateWoo' ),
				icon: 'https://wordpress.com/wp-content/lib/marketplace-images/automatewoo.png',
				short_description: __( 'Create a range of automated workflows' ),
			},
			{
				slug: 'woocommerce-shipment-tracking',
				name: __( 'Shipment tracking' ),
				icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce-shipment-tracking.png',
				short_description: __( 'Provide shipment tracking information' ),
			},
			{
				slug: 'woocommerce-shipping-usps',
				name: __( 'WooCommerce USPS Shipping' ),
				icon: 'https://wordpress.com/wp-content/lib/marketplace-images/woocommerce.svg',
				short_description: __( 'Get shipping rates from the USPS API' ),
			},
			{
				slug: 'optinmonster',
				name: __( 'OptinMonster' ),
				icon: 'https://ps.w.org/optinmonster/assets/icon-256x256.png?rev=1145864',
				short_description: __( 'Monetize your website traffic' ),
			},
		],
	},
};

export function useCategories(
	allowedCategories = ALLOWED_CATEGORIES
): Record< string, Category > {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const isJetpack = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);

	// Only showing these top level categories for now
	const allowed = allowedCategories.slice();

	// Jetpack sites shouldn't see paid plugins
	if ( isJetpack && allowed.indexOf( 'paid' ) >= 0 ) {
		allowed.splice( allowed.indexOf( 'paid' ), 1 );
	}

	return Object.fromEntries(
		Object.entries( categories ).filter( ( [ key ] ) => allowed.includes( key ) )
	);
}
