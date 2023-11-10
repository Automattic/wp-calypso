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

export const THEME_COLLECTIONS = {
	marketplace: {
		query: {
			collection: 'recommended',
			filter: '',
			number: 10,
			page: 1,
			search: '',
			tier: 'marketplace',
		},
		title: translate( 'Partner Themes' ),
		fullTitle: translate( 'Partner Themes' ),
		collectionSlug: 'partner-themes',
		description: translate( 'Professional themes designed and developed by our partners.' ),
		seeAllLink: '/themes/marketplace',
	},
};
