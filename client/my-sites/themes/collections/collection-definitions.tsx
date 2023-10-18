import { translate } from 'i18n-calypso';

export const THEME_COLLECTIONS = {
	recommended: {
		query: {
			collection: 'recommended',
			filter: '',
			number: 10,
			page: 1,
			search: '',
			tier: '',
		},
		title: translate( 'Featured Themes' ),
		collectionSlug: 'recommended',
		description: (
			<p>{ translate( 'An expert-curated list of themes to get the most out of your site.' ) }</p>
		),
		seeAllLink: '/themes',
	},
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
		description: (
			<p>
				{ translate(
					'Get Premium and unlock a bundle of exclusive themes to take your website even further.'
				) }
			</p>
		),
		seeAllLink: '/themes/premium',
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
		title: translate( 'Partner Themes' ),
		collectionSlug: 'partner-themes',
		description: (
			<p>{ translate( 'Professional themes designed and developed by our partners.' ) }</p>
		),
		seeAllLink: '/themes/marketplace',
	},
	blog: {
		query: {
			collection: 'recommended',
			filter: 'blog',
			number: 10,
			page: 1,
			search: '',
			tier: '',
		},
		title: translate( 'Writers and Bloggers Themes' ),
		collectionSlug: 'blog-themes',
		description: null,
		seeAllLink: '/themes/filter/blog',
	},
	portfolio: {
		query: {
			collection: 'recommended',
			filter: 'portfolio',
			number: 10,
			page: 1,
			search: '',
			tier: '',
		},
		title: translate( 'Portfolio Themes' ),
		collectionSlug: 'portfolio-themes',
		description: null,
		seeAllLink: '/themes/filter/portfolio',
	},
	business: {
		query: {
			collection: 'recommended',
			filter: 'business',
			number: 10,
			page: 1,
			search: '',
			tier: '',
		},
		title: translate( 'Business Themes' ),
		collectionSlug: 'business-themes',
		description: (
			<p>
				{ translate(
					'Professionally designed to take your business to the next level — no matter its size or kind.'
				) }
			</p>
		),
		seeAllLink: '/themes/filter/business',
	},
	'art-design': {
		query: {
			collection: 'recommended',
			filter: 'art-design',
			number: 10,
			page: 1,
			search: '',
			tier: '',
		},
		title: translate( 'Art and Design Themes' ),
		collectionSlug: 'art-design-themes',
		description: null,
		seeAllLink: '/themes/filter/art-design',
	},
};
