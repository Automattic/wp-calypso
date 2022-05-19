import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Category } from '.';

export const ALLOWED_CATEGORIES = [
	'discover',
	'paid',
	'popular',
	'featured',
	'analytics',
	'booking',
	'customer',
	'design',
	'donations',
	'ecommerce',
	'education',
	'finance',
	'marketing',
	'seo',
	'photo',
	'social',
	'widgets',
	'email',
	'security',
	'shipping',
	'posts',
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
		paid: { name: __( 'Top paid plugins' ), slug: 'paid', tags: [] },
		popular: { name: __( 'Top free plugins' ), slug: 'popular', tags: [] },
		featured: { name: __( 'Editor’s pick' ), slug: 'featured', tags: [] },
		analytics: {
			name: __( 'Analytics' ),
			description: __( 'Analytics' ),
			icon: 'grid',
			slug: 'analytics',
			tags: [ 'analytics' ],
		},
		booking: {
			name: __( 'Booking & Scheduling' ),
			description: __( 'Booking' ),
			icon: 'grid',
			slug: 'booking',
			tags: [
				'booking',
				'scheduling',
				'appointment',
				'reservations',
				'reservation',
				'booking-calendar',
			],
		},
		customer: {
			name: __( 'Customer Service' ),
			description: __( 'Customer Service' ),
			icon: 'grid',
			slug: 'customer',
			tags: [ 'customer-service' ],
		},
		design: {
			name: __( 'Design' ),
			description: __( 'Design' ),
			icon: 'grid',
			slug: 'design',
			tags: [ 'design' ],
		},
		donations: {
			name: __( 'Donations' ),
			description: __( 'Donations' ),
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
		ecommerce: {
			name: __( 'Ecommerce & Business' ),
			description: __( 'Ecommerce' ),
			icon: 'grid',
			slug: 'ecommerce',
			tags: [ 'ecommerce', 'e-commerce', 'woocommerce', 'business', 'business-directory' ],
		},
		education: {
			name: __( 'Education' ),
			description: __( 'Education' ),
			icon: 'grid',
			slug: 'education',
			tags: [ 'education' ],
		},
		email: {
			name: __( 'Email' ),
			description: __( 'Email' ),
			icon: 'grid',
			slug: 'email',
			tags: [ 'email' ],
		},
		finance: {
			name: __( 'Finance & Payments' ),
			description: __( 'Finance' ),
			icon: 'grid',
			slug: 'finance',
			tags: [ 'finance', 'payment', 'credit-card', 'payment-gateway' ],
		},
		marketing: {
			name: __( 'Marketing' ),
			description: __( 'Marketing' ),
			icon: 'grid',
			slug: 'marketing',
			tags: [ 'marketing' ],
		},
		photo: {
			name: __( 'Photo & Video' ),
			description: __( 'Photo & Video' ),
			icon: 'grid',
			slug: 'photo',
			tags: [ 'photo', 'video', 'media' ],
		},
		posts: {
			name: __( 'Posts & Posting' ),
			description: __( 'Posts & Posting' ),
			icon: 'grid',
			slug: 'posts',
			tags: [ 'posts', 'post', 'page', 'pages' ],
		},
		seo: {
			name: __( 'Search Optimization' ),
			description: __( 'Search Optimization' ),
			icon: 'grid',
			slug: 'seo',
			tags: [ 'seo' ],
		},
		security: {
			name: __( 'Security' ),
			description: __( 'Security' ),
			icon: 'grid',
			slug: 'security',
			tags: [ 'security' ],
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
		social: {
			name: __( 'Social' ),
			description: __( 'Social' ),
			icon: 'grid',
			slug: 'social',
			tags: [ 'social', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'pinterest' ],
		},
		widgets: {
			name: __( 'Widgets' ),
			description: __( 'Widgets' ),
			icon: 'grid',
			slug: 'widgets',
			tags: [ 'widgets' ],
		},
	};

	return Object.fromEntries(
		Object.entries( categories ).filter( ( [ key ] ) => allowed.includes( key ) )
	);
}
