import { translate } from 'i18n-calypso';

export type ThemeCollectionDefinition = {
	query: {
		collection: string;
		filter: string;
		number: number;
		page: number;
		search: string;
		tier: string;
	};
	title: string;
	fullTitle: string;
	collectionSlug: string;
	description: string | null;
	seeAllLink: string;
};

export const THEME_COLLECTIONS: Record< string, ThemeCollectionDefinition > = {
	recommended: {
		query: {
			collection: 'recommended',
			filter: '',
			number: 20,
			page: 1,
			search: '',
			tier: '',
		},
		get title() {
			return translate( 'Our favorites' );
		},
		get fullTitle() {
			return translate( 'Our favorites' );
		},
		collectionSlug: 'recommended-themes',
		get description() {
			return translate( 'Exceptional themes selected by the WordPress.com design team.' );
		},
		seeAllLink: '/themes/recommended/collection',
	},
	marketplace: {
		query: {
			collection: 'recommended',
			filter: '',
			number: 10,
			page: 1,
			search: '',
			tier: 'marketplace',
		},
		get title() {
			return translate( 'Partner themes' );
		},
		get fullTitle() {
			return translate( 'Partner themes' );
		},
		collectionSlug: 'partner-themes',
		get description() {
			return translate( 'Professional themes designed and developed by our partners.' );
		},
		seeAllLink: '/themes/marketplace',
	},
	partner: {
		query: {
			collection: 'recommended',
			filter: '',
			number: 10,
			page: 1,
			search: '',
			tier: 'partner',
		},
		get title() {
			return translate( 'Partner themes' );
		},
		get fullTitle() {
			return translate( 'Partner themes' );
		},
		collectionSlug: 'partner-themes',
		get description() {
			return translate( 'Professional themes designed and developed by our partners.' );
		},
		seeAllLink: '/themes/partner',
	},
};
