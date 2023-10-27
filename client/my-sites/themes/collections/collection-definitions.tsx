import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';

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
		title: translate( 'Featured' ),
		fullTitle: translate( 'Featured Themes' ),
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
		title: translate( 'Premium' ),
		fullTitle: translate( 'Premium Themes' ),
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
	free: {
		query: {
			collection: 'recommended',
			filter: '',
			number: 10,
			page: 1,
			search: '',
			tier: 'free',
		},
		title: translate( 'Free' ),
		fullTitle: translate( 'Free Themes' ),
		collectionSlug: 'free-themes',
		description: null,
		seeAllLink: '/themes/free',
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
		title: translate( 'Partner' ),
		fullTitle: translate( 'Partner Themes' ),
		collectionSlug: 'partner-themes',
		description: (
			<p>
				{ translate(
					'Professional themes designed and developed by our partners. {{link}}Learn more{{/link}}.',
					{
						components: {
							link: (
								<ExternalLink
									href={ localizeUrl( 'https://wordpress.com/support/partner-themes/' ) }
									target="_blank"
								/>
							),
						},
					}
				) }
			</p>
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
		title: translate( 'Writers and Bloggers' ),
		fullTitle: translate( 'Writers and Bloggers Themes' ),
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
		title: translate( 'Portfolio' ),
		fullTitle: translate( 'Portfolio Themes' ),
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
		title: translate( 'Business' ),
		fullTitle: translate( 'Business Themes' ),
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
		title: translate( 'Art and Design' ),
		fullTitle: translate( 'Art and Design Themes' ),
		collectionSlug: 'art-design-themes',
		description: null,
		seeAllLink: '/themes/filter/art-design',
	},
};
