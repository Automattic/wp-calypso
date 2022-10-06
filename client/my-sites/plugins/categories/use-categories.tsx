import { useI18n } from '@wordpress/react-i18n';
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

export function useCategories(
	allowedCategories = ALLOWED_CATEGORIES
): Record< string, Category > {
	const { __ } = useI18n();
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

	const categories = {
		discover: { name: __( 'Discover' ), slug: 'discover', tags: [] },
		paid: {
			name: __( 'Must-have premium plugins' ),
			categoryDescription: __( 'Add the best-loved plugins on WordPress.com' ),
			slug: 'paid',
			tags: [],
		},
		popular: {
			name: __( 'The free essentials' ),
			categoryDescription: __( 'Add and install the very best free plugins' ),
			slug: 'popular',
			tags: [],
		},
		featured: {
			name: __( 'Our developers’ favorites' ),
			categoryDescription: __( 'Start fast with these WordPress.com team picks' ),
			slug: 'featured',
			tags: [],
		},
		seo: {
			name: __( 'Search Engine Optimization' ),
			description: __( 'Search Optimization' ),
			icon: 'grid',
			slug: 'seo',
			tags: [ 'seo' ],
		},
		ecommerce: {
			name: __( 'Ecommerce & Business' ),
			description: __( 'Ecommerce' ),
			categoryDescription: __(
				'Everything you need to turn your WordPress site into a powerful online store.'
			),
			icon: 'grid',
			slug: 'ecommerce',
			tags: [ 'ecommerce', 'e-commerce', 'woocommerce', 'business', 'business-directory' ],
		},
		booking: {
			name: __( 'Booking & Scheduling' ),
			description: __( 'Booking' ),
			categoryDescription: __( 'Add a fully functional booking system to your site.' ),
			icon: 'grid',
			slug: 'booking',
			tags: [ 'booking', 'scheduling', 'appointment', 'reservation', 'booking-calendar' ],
		},
		events: {
			name: __( 'Events Calendar' ),
			description: __( 'Events Calendar' ),
			icon: 'grid',
			slug: 'events',
			tags: [ 'events-calendar', 'calendar', 'calendar-event' ],
		},

		social: {
			name: __( 'Social' ),
			description: __( 'Social' ),
			icon: 'grid',
			slug: 'social',
			tags: [ 'social', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'pinterest' ],
		},
		email: {
			name: __( 'Email' ),
			description: __( 'Email' ),
			icon: 'grid',
			slug: 'email',
			tags: [ 'email' ],
		},
		security: {
			name: __( 'Security' ),
			description: __( 'Security' ),
			icon: 'grid',
			slug: 'security',
			tags: [ 'security' ],
		},
		finance: {
			name: __( 'Finance & Payments' ),
			description: __( 'Finance' ),
			icon: 'grid',
			slug: 'finance',
			tags: [ 'finance', 'payment', 'credit-card', 'payment-gateway' ],
		},
		shipping: {
			name: __( 'Shipping & Delivery' ),
			description: __( 'Shipping & Delivery' ),
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
			description: __( 'Analytics' ),
			categoryDescription: __(
				`Tools to help you better understand your site's visitors and performance.`
			),
			icon: 'grid',
			slug: 'analytics',
			tags: [ 'analytics' ],
		},
		marketing: {
			name: __( 'Marketing' ),
			description: __( 'Marketing' ),
			icon: 'grid',
			slug: 'marketing',
			tags: [ 'marketing' ],
		},
		design: {
			name: __( 'Design' ),
			description: __( 'Design' ),
			categoryDescription: __(
				'A collection of tools that will give you more control over the design of your site.'
			),
			icon: 'grid',
			slug: 'design',
			tags: [ 'design', 'blocks', 'editor' ],
		},
		photo: {
			name: __( 'Photo & Video' ),
			description: __( 'Photo & Video' ),
			icon: 'grid',
			slug: 'photo',
			tags: [ 'photo', 'video', 'media' ],
		},
		customer: {
			name: __( 'CRM & Live Chat' ),
			description: __( 'Customer Service' ),
			icon: 'grid',
			slug: 'customer',
			tags: [ 'customer-service', 'live-chat', 'crm' ],
		},
		donations: {
			name: __( 'Crowdfunding' ),
			description: __( 'Crowdfunding' ),
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
			description: __( 'Education' ),
			icon: 'grid',
			slug: 'education',
			tags: [ 'education', 'lms', 'learning-management-systems', 'elearning' ],
		},
		widgets: {
			name: __( 'Widgets' ),
			description: __( 'Widgets' ),
			icon: 'grid',
			slug: 'widgets',
			tags: [ 'widgets' ],
		},
		posts: {
			name: __( 'Posts & Posting' ),
			description: __( 'Posts & Posting' ),
			icon: 'grid',
			slug: 'posts',
			tags: [ 'posts', 'post', 'page', 'pages' ],
		},
	};

	return Object.fromEntries(
		Object.entries( categories ).filter( ( [ key ] ) => allowed.includes( key ) )
	);
}
