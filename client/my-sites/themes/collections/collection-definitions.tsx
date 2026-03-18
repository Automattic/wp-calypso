import { translate } from 'i18n-calypso';
import type { TranslateResult } from 'i18n-calypso';

export type ThemeCollectionDescription =
	| TranslateResult
	| ( ( options?: { search?: string } ) => TranslateResult )
	| null;

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
	description: ThemeCollectionDescription;
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
	community: {
		query: {
			collection: '',
			filter: '',
			number: 100,
			page: 1,
			search: '',
			tier: '',
		},
		get title() {
			return translate( 'Community themes' );
		},
		get fullTitle() {
			return translate( 'Community themes' );
		},
		collectionSlug: 'community-themes',
		description: ( { search } = {} ) =>
			search
				? translate(
						'Explore "%(query)s" themes from the WordPress community, and upload to install when ready.',
						{ args: { query: search } }
				  )
				: translate(
						'Explore themes from the WordPress community, and upload to install when ready.'
				  ),
		seeAllLink: '/themes/community/collection',
	},
};
