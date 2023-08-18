import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

function findParsedFilter( filter, content ) {
	const splitFilters = filter?.replace( 'subject:', '' )?.split( '+' ) || [];
	const categories = Object.keys( content );
	const parsedFilter = splitFilters.find( ( f ) => categories.includes( f ) );
	return parsedFilter;
}

export default function useThemeShowcaseLoggedOutSeoContent( filter, tier ) {
	const translate = useTranslate();

	/**
	 * SEO content:
	 * - title: the page's <title> tag.
	 * - header: the page's main heading.
	 * - description: the page's sub-heading and <meta> description.
	 */
	const THEME_SHOWCASE_LOGGED_OUT_SEO_CONTENT = useMemo(
		() => ( {
			recommended: {
				all: {
					title: translate( 'WordPress Themes' ),
					header: translate( 'Find the perfect theme for your website.' ),
					description: translate(
						"Beautiful and responsive WordPress themes. Choose from free and premium options for all types of websites. Then, activate the one that's best for you."
					),
				},
				free: {
					title: translate( 'Free WordPress Themes' ),
					header: translate( 'Find the perfect free WordPress theme for your blog or website.' ),
					description: translate(
						'Browse all free themes for WordPress.com. Try one or try them all. Risk-free.'
					),
				},
				premium: {
					title: translate( 'Premium WordPress Themes' ),
					header: translate( 'Find the perfect premium WordPress theme for your blog or website.' ),
					description: translate(
						"Browse all premium themes for WordPress.com. Available on all Premium, Business, and Ecommerce plans. Activate the one that's right for you."
					),
				},
				marketplace: {
					title: translate( 'Partner WordPress Themes' ),
					header: translate( 'Find the perfect partner WordPress theme for your blog or website.' ),
					description: translate(
						"Browse all partner themes for WordPress.com. Activate the one that's right for you, risk-free for 14 days."
					),
				},
			},
			blog: {
				all: {
					title: translate( 'Blog WordPress Themes' ),
					header: translate( 'Find the perfect theme for your blog.' ),
					description: translate(
						"Start your blog with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Blog WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your blog.' ),
					description: translate(
						"Launch your blog with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Blog WordPress Themes' ),
					header: translate( 'Choose premium themes for your blog.' ),
					description: translate(
						"Enhance your blog with the perfect premium theme. Available on all Premium, Business, and Ecommerce plans. Activate the one that's right for you."
					),
				},
				marketplace: {
					title: translate( 'Partner Blog WordPress Themes' ),
					header: translate( 'Select partner themes for your blog.' ),
					description: translate(
						"Improve your blog with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			business: {
				all: {
					title: translate( 'Business WordPress Themes' ),
					header: translate( 'Find the perfect theme for your business website.' ),
					description: translate(
						"Start your business website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Business WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your business website.' ),
					description: translate(
						"Launch your business website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Business WordPress Themes' ),
					header: translate( 'Choose premium themes for your business website.' ),
					description: translate(
						"Enhance your business website with the perfect premium theme. Available on all Premium, Business, and Ecommerce plans. Activate the one that's right for you."
					),
				},
				marketplace: {
					title: translate( 'Partner Business WordPress Themes' ),
					header: translate( 'Select partner themes for your business website.' ),
					description: translate(
						"Improve your business website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			portfolio: {
				all: {
					title: translate( 'Portfolio WordPress Themes' ),
					header: translate( 'Find the perfect theme for your portfolio.' ),
					description: translate(
						"Start your portfolio with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Portfolio WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your portfolio.' ),
					description: translate(
						"Launch your portfolio website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Portfolio WordPress Themes' ),
					header: translate( 'Choose premium themes for your portfolio.' ),
					description: translate(
						"Enhance your portfolio website with the perfect premium theme. Available on all Premium, Business, and Ecommerce plans. Activate the one that's right for you."
					),
				},
				marketplace: {
					title: translate( 'Partner Portfolio WordPress Themes' ),
					header: translate( 'Select partner themes for your portfolio.' ),
					description: translate(
						"Improve your portfolio website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			store: {
				all: {
					title: translate( 'Store WordPress Themes' ),
					header: translate( 'Find the perfect theme for your online store.' ),
					description: translate(
						"Start your online store with the perfect theme. Choose from options for WordPress and WooCommerce sites. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Store WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your online store.' ),
					description: translate(
						"Launch your online store with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Store WordPress Themes' ),
					header: translate( 'Choose premium themes for your online store.' ),
					description: translate(
						"Enhance your online store with the perfect premium theme. Available on all Premium, Business, and Ecommerce plans. Activate the one that's right for you."
					),
				},
				marketplace: {
					title: translate( 'Partner Store WordPress Themes' ),
					header: translate( 'Select partner themes for your online store.' ),
					description: translate(
						"Improve your online store with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			about: {
				all: {
					title: translate( 'About Me WordPress Themes' ),
					header: translate( 'Find the perfect theme for your About Me website.' ),
					description: translate(
						"Start your About Me website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free About Me WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your About Me website.' ),
					description: translate(
						"Launch your About Me website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium About Me WordPress Themes' ),
					header: translate( 'Choose premium themes for your About Me website.' ),
					description: translate(
						"Enhance your About Me website with the perfect premium theme. Available on all Premium, Business, and Ecommerce plans. Activate the one that's right for you."
					),
				},
				marketplace: {
					title: translate( 'Partner About Me WordPress Themes' ),
					header: translate( 'Select partner themes for your About Me website.' ),
					description: translate(
						"Improve your About Me website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'link-in-bio': {
				all: {
					title: translate( 'Link in Bio WordPress Themes' ),
					header: translate( 'Find the perfect theme for your link in bio website.' ),
					description: translate(
						"Start your link in bio website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Link in Bio WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your link in bio website.' ),
					description: translate(
						"Launch your link in bio website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Link in Bio WordPress Themes' ),
					header: translate( 'Choose premium themes for your link in bio website.' ),
					description: translate(
						"Enhance your link in bio website with the perfect premium theme. Available on all Premium, Business, and Ecommerce plans. Activate the one that's right for you."
					),
				},
				marketplace: {
					title: translate( 'Partner Link in Bio WordPress Themes' ),
					header: translate( 'Select partner themes for your link in bio website.' ),
					description: translate(
						"Improve your link in bio website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			newsletter: {
				all: {
					title: translate( 'Newsletter WordPress Themes' ),
					header: translate( 'Find the perfect theme for your site-hosted newsletter.' ),
					description: translate(
						"Start your newsletter with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Newsletter WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your site-hosted newsletter.' ),
					description: translate(
						"Launch your newsletter with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Newsletter WordPress Themes' ),
					header: translate( 'Choose premium themes for your site-hosted newsletter.' ),
					description: translate(
						"Enhance your newsletter with the perfect premium theme. Available on all Premium, Business, and Ecommerce plans. Activate the one that's right for you."
					),
				},
				marketplace: {
					title: translate( 'Partner Newsletter WordPress Themes' ),
					header: translate( 'Select partner themes for your site-hosted newsletter.' ),
					description: translate(
						"Improve your newsletter with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
		} ),
		[ translate ]
	);

	const parsedFilter =
		findParsedFilter( filter, THEME_SHOWCASE_LOGGED_OUT_SEO_CONTENT ) || 'recommended';
	const parsedTier = tier || 'all';

	const seoContent = THEME_SHOWCASE_LOGGED_OUT_SEO_CONTENT?.[ parsedFilter ]?.[ parsedTier ];

	if ( ! seoContent ) {
		return THEME_SHOWCASE_LOGGED_OUT_SEO_CONTENT.recommended.all;
	}

	return seoContent;
}
