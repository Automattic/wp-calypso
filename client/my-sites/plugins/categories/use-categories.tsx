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
];

export const categories: Record< string, Category > = {
	discover: { name: __( 'Discover' ), slug: 'discover', tags: [] },
	paid: {
		name: __( 'Must-have premium plugins' ),
		description: __( 'Add the best-loved plugins on WordPress.com' ),
		slug: 'paid',
		tags: [],
	},
	popular: {
		name: __( 'The free essentials' ),
		description: __( 'Add and install the very best free plugins' ),
		slug: 'popular',
		tags: [],
	},
	featured: {
		name: __( 'Our developers’ favorites' ),
		description: __( 'Start fast with these WordPress.com team picks' ),
		slug: 'featured',
		tags: [],
	},
	seo: {
		name: __( 'Search Engine Optimization' ),
		description: __( 'Fine-tune your site’s content and metadata for search engine success.' ),
		icon: 'grid',
		slug: 'seo',
		tags: [ 'seo' ],
	},
	ecommerce: {
		name: __( 'Ecommerce & Business' ),
		description: __( 'Turn your site into a powerful online store.' ),
		icon: 'grid',
		slug: 'ecommerce',
		tags: [ 'ecommerce', 'e-commerce', 'woocommerce', 'business', 'business-directory' ],
	},
	booking: {
		name: __( 'Booking & Scheduling' ),
		description: __( 'Take bookings and manage your availability right from your site.' ),
		icon: 'grid',
		slug: 'booking',
		tags: [ 'booking', 'scheduling', 'appointment', 'reservation', 'booking-calendar' ],
	},
	events: {
		name: __( 'Events Calendar' ),
		description: __( 'Build buzz and set the scene with an on-site events calendar.' ),
		icon: 'grid',
		slug: 'events',
		tags: [ 'events-calendar', 'calendar', 'calendar-event' ],
	},

	social: {
		name: __( 'Social' ),
		description: __( 'Connect to your audience and amplify your content on social.' ),
		icon: 'grid',
		slug: 'social',
		tags: [ 'social', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'pinterest' ],
	},
	email: {
		name: __( 'Email' ),
		description: __( 'Forge a direct connection with your readers through email.' ),
		icon: 'grid',
		slug: 'email',
		tags: [ 'email' ],
	},
	security: {
		name: __( 'Security' ),
		description: __( 'Take advanced control of your site’s security.' ),
		icon: 'grid',
		slug: 'security',
		tags: [ 'security' ],
	},
	finance: {
		name: __( 'Finance & Payments' ),
		description: __(
			'Sell products, subscriptions, and services while keeping on top of every transaction.'
		),
		icon: 'grid',
		slug: 'finance',
		tags: [ 'finance', 'payment', 'credit-card', 'payment-gateway' ],
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
	},
	analytics: {
		name: __( 'Analytics' ),
		description: __( 'Go deeper and learn faster with site visitor and performance insights.' ),
		icon: 'grid',
		slug: 'analytics',
		tags: [ 'analytics' ],
	},
	marketing: {
		name: __( 'Marketing' ),
		description: __( 'Bring in new business and shine a spotlight on your projects or products.' ),
		icon: 'grid',
		slug: 'marketing',
		tags: [ 'marketing' ],
	},
	design: {
		name: __( 'Design' ),
		description: __( 'Finesse your site’s design with advanced customization tools.' ),
		icon: 'grid',
		slug: 'design',
		tags: [ 'design', 'blocks', 'editor' ],
	},
	photo: {
		name: __( 'Photo & Video' ),
		description: __(
			'Create, share, edit, and manage beautiful images and video {with added precision and flexibility.'
		),
		icon: 'grid',
		slug: 'photo',
		tags: [ 'photo', 'video', 'media' ],
	},
	customer: {
		name: __( 'CRM & Live Chat' ),
		description: __( 'Create stand-out customer service experiences for your site visitors.' ),
		icon: 'grid',
		slug: 'customer',
		tags: [ 'customer-service', 'live-chat', 'crm' ],
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
	},
	education: {
		name: __( 'Learning Management Systems' ),
		description: __( 'Create, run, and manage interactive courses and learning experiences.' ),
		icon: 'grid',
		slug: 'education',
		tags: [ 'education', 'lms', 'learning-management-systems', 'elearning' ],
	},
	widgets: {
		name: __( 'Widgets' ),
		description: __( 'Take widgets to the next level with advanced control and customization.' ),
		icon: 'grid',
		slug: 'widgets',
		tags: [ 'widgets' ],
	},
	posts: {
		name: __( 'Posts & Posting' ),
		description: __( 'Unlock advanced content planning, publishing, and scheduling features.' ),
		icon: 'grid',
		slug: 'posts',
		tags: [ 'posts', 'post', 'page', 'pages' ],
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
