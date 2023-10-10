import { translate } from 'i18n-calypso';

export const THEME_COLLECTIONS = {
	premium: {
		query: {
			collection: 'recommended',
			filter: '',
			number: 10,
			page: 1,
			search: '',
			tier: 'premium',
		},
		title: translate( 'Premium Themes' ),
		collectionSlug: 'premium-themes',
		description: <p>Lorem ipsum dolor sit amet</p>,
	},
	partner: {
		query: {
			collection: 'recommended',
			filter: '',
			number: 10,
			page: 1,
			search: '',
			tier: 'marketplace',
		},
		title: translate( 'Partner Themes' ),
		collectionSlug: 'partner-themes',
		description: <p>Lorem ipsum dolor sit amet</p>,
	},
};
