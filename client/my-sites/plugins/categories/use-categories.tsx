import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Category } from '.';

export const allowedCategories = [
	'discover',
	'paid',
	'popular',
	'featured',
	'analytics',
	'business',
	'customer',
	'design',
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
	'posts',
];

export function useCategories(): Record< string, Category > {
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
		business: {
			name: __( 'Business' ),
			description: __( 'Business' ),
			icon: 'grid',
			slug: 'business',
			tags: [ 'business' ],
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
		ecommerce: {
			name: __( 'Ecommerce' ),
			description: __( 'Ecommerce' ),
			icon: 'grid',
			slug: 'ecommerce',
			tags: [ 'ecommerce', 'woocommerce' ],
		},
		education: {
			name: __( 'Education' ),
			description: __( 'Education' ),
			icon: 'grid',
			slug: 'education',
			tags: [ 'education' ],
		},
		finance: {
			name: __( 'Finance' ),
			description: __( 'Finance' ),
			icon: 'grid',
			slug: 'finance',
			tags: [ 'finance' ],
		},
		marketing: {
			name: __( 'Marketing' ),
			description: __( 'Marketing' ),
			icon: 'grid',
			slug: 'marketing',
			tags: [ 'marketing' ],
		},
		seo: {
			name: __( 'Search Optimization' ),
			description: __( 'Search Optimization' ),
			icon: 'grid',
			slug: 'seo',
			tags: [ 'seo' ],
		},
		photo: {
			name: __( 'Photo & Video' ),
			description: __( 'Photo & Video' ),
			icon: 'grid',
			slug: 'photo',
			tags: [ 'photo', 'video', 'media' ],
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
