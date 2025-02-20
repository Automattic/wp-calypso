import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PERSONAL,
	getPlan,
} from '@automattic/calypso-products';
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
					header: translate( 'Find the perfect theme for your website' ),
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
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Browse all premium themes for WordPress.com. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
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
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your blog with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
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
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your business website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
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
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your portfolio website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
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
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your online store with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
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
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your About Me website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
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
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your newsletter with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
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
			entertainment: {
				all: {
					title: translate( 'Entertainment WordPress Themes' ),
					header: translate( 'Find the perfect theme for your entertainment website.' ),
					description: translate(
						"Start your entertainment website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Entertainment WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your entertainment website.' ),
					description: translate(
						"Launch your entertainment website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Entertainment WordPress Themes' ),
					header: translate( 'Choose premium themes for your entertainment website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your entertainment website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Entertainment WordPress Themes' ),
					header: translate( 'Select partner themes for your entertainment website.' ),
					description: translate(
						"Improve your entertainment website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'coming-soon': {
				all: {
					title: translate( 'Coming Soon WordPress Themes' ),
					header: translate( 'Find the perfect coming soon theme for your website.' ),
					description: translate(
						"Start your website with the perfect coming soon theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Coming Soon WordPress Themes' ),
					header: translate( 'Discover the perfect free coming soon theme for your website.' ),
					description: translate(
						"Launch your website with the perfect free coming soon theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Coming Soon WordPress Themes' ),
					header: translate( 'Choose premium coming soon themes for your website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your website with the perfect premium coming soon theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Coming Soon WordPress Themes' ),
					header: translate( 'Select partner coming soon themes for your website.' ),
					description: translate(
						"Improve your website with the perfect partner coming soon theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			podcast: {
				all: {
					title: translate( 'Podcast WordPress Themes' ),
					header: translate( 'Find the perfect theme for your podcast website.' ),
					description: translate(
						"Start your podcast website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Podcast WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your podcast website.' ),
					description: translate(
						"Launch your podcast website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Podcast WordPress Themes' ),
					header: translate( 'Choose premium themes for your podcast website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your podcast website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Podcast WordPress Themes' ),
					header: translate( 'Select partner themes for your podcast website.' ),
					description: translate(
						"Improve your podcast website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'community-non-profit': {
				all: {
					title: translate( 'Community & Non-profit WordPress Themes' ),
					header: translate(
						"Find the perfect theme for your non-profit or community organization's website."
					),
					description: translate(
						"Start your non-profit or community organization's website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Community & Non-profit WordPress Themes' ),
					header: translate(
						"Discover the perfect free theme for your non-profit or community organization's website."
					),
					description: translate(
						"Launch your non-profit or community organization's website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Community & Non-profit WordPress Themes' ),
					header: translate(
						"Choose premium themes for your non-profit or community organization's website."
					),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your non-profit or community organization's website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Community & Non-profit WordPress Themes' ),
					header: translate(
						"Select partner themes for your non-profit or community organization's website."
					),
					description: translate(
						"Improve your non-profit or community organization's website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'fashion-beauty': {
				all: {
					title: translate( 'Fashion & Beauty WordPress Themes' ),
					header: translate( 'Find the perfect theme for your fashion and beauty website.' ),
					description: translate(
						"Start your fashion and beauty website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Fashion & Beauty WordPress Themes' ),
					header: translate(
						'Discover the perfect free theme for your fashion and beauty website.'
					),
					description: translate(
						"Launch your fashion and beauty website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Fashion & Beauty WordPress Themes' ),
					header: translate( 'Choose premium themes for your fashion and beauty website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your fashion and beauty website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Fashion & Beauty WordPress Themes' ),
					header: translate( 'Select partner themes for your fashion and beauty website.' ),
					description: translate(
						"Improve your fashion and beauty website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'travel-lifestyle': {
				all: {
					title: translate( 'Travel & Lifestyle WordPress Themes' ),
					header: translate( 'Find the perfect theme for your travel and lifestyle website.' ),
					description: translate(
						"Start your travel and lifestyle website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Travel & Lifestyle WordPress Themes' ),
					header: translate(
						'Discover the perfect free theme for your travel and lifestyle website.'
					),
					description: translate(
						"Launch your travel and lifestyle website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Travel & Lifestyle WordPress Themes' ),
					header: translate( 'Choose premium themes for your travel and lifestyle website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your travel and lifestyle website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Travel & Lifestyle WordPress Themes' ),
					header: translate( 'Select partner themes for your travel and lifestyle website.' ),
					description: translate(
						"Improve your travel and lifestyle website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			restaurant: {
				all: {
					title: translate( 'Restaurant WordPress Themes' ),
					header: translate( 'Find the perfect theme for your restaurant website.' ),
					description: translate(
						"Start your restaurant website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Restaurant WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your restaurant website.' ),
					description: translate(
						"Launch your restaurant website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Restaurant WordPress Themes' ),
					header: translate( 'Choose premium themes for your restaurant website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your restaurant website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Restaurant WordPress Themes' ),
					header: translate( 'Select partner themes for your restaurant website.' ),
					description: translate(
						"Improve your restaurant website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			music: {
				all: {
					title: translate( 'Music WordPress Themes' ),
					header: translate( 'Find the perfect theme for your music website.' ),
					description: translate(
						"Start your music website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Music WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your music website.' ),
					description: translate(
						"Launch your music website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Music WordPress Themes' ),
					header: translate( 'Choose premium themes for your music website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your music website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Music WordPress Themes' ),
					header: translate( 'Select partner themes for your music website.' ),
					description: translate(
						"Improve your music website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			magazine: {
				all: {
					title: translate( 'Magazine WordPress Themes' ),
					header: translate( 'Find the perfect theme for your magazine website.' ),
					description: translate(
						"Start your magazine website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Magazine WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your magazine website.' ),
					description: translate(
						"Launch your magazine website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Magazine WordPress Themes' ),
					header: translate( 'Choose premium themes for your magazine website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your magazine website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Magazine WordPress Themes' ),
					header: translate( 'Select partner themes for your magazine website.' ),
					description: translate(
						"Improve your magazine website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			education: {
				all: {
					title: translate( 'Education WordPress Themes' ),
					header: translate( 'Find the perfect theme for your education website.' ),
					description: translate(
						"Start your education website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Education WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your education website.' ),
					description: translate(
						"Launch your education website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Education WordPress Themes' ),
					header: translate( 'Choose premium themes for your education website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your education website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Education WordPress Themes' ),
					header: translate( 'Select partner themes for your education website.' ),
					description: translate(
						"Improve your education website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'authors-writers': {
				all: {
					title: translate( 'Author & Writer WordPress Themes' ),
					header: translate( 'Find the perfect theme for your author or writer website.' ),
					description: translate(
						"Start your author or writer website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Author & Writer WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your author or writer website.' ),
					description: translate(
						"Launch your author or writer website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Author & Writer WordPress Themes' ),
					header: translate( 'Choose premium themes for your author or writer website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your author or writer website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Author & Writer WordPress Themes' ),
					header: translate( 'Select partner themes for your author or writer website.' ),
					description: translate(
						"Improve your author or writer website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'health-wellness': {
				all: {
					title: translate( 'Health & Wellness WordPress Themes' ),
					header: translate( 'Find the perfect theme for your health and wellness website.' ),
					description: translate(
						"Start your health and wellness website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Health & Wellness WordPress Themes' ),
					header: translate(
						'Discover the perfect free theme for your health and wellness website.'
					),
					description: translate(
						"Launch your health and wellness website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Health & Wellness WordPress Themes' ),
					header: translate( 'Choose premium themes for your health and wellness website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your health and wellness website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Health & Wellness WordPress Themes' ),
					header: translate( 'Select partner themes for your health and wellness website.' ),
					description: translate(
						"Improve your health and wellness website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'real-estate': {
				all: {
					title: translate( 'Real Estate WordPress Themes' ),
					header: translate( 'Find the perfect theme for your real estate website.' ),
					description: translate(
						"Start your real estate website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Real Estate WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your real estate website.' ),
					description: translate(
						"Launch your real estate website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Real Estate WordPress Themes' ),
					header: translate( 'Choose premium themes for your real estate website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your real estate website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Real Estate WordPress Themes' ),
					header: translate( 'Select partner themes for your real estate website.' ),
					description: translate(
						"Improve your real estate website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			video: {
				all: {
					title: translate( 'Video WordPress Themes' ),
					header: translate( 'Find the perfect theme for your video website.' ),
					description: translate(
						"Start your video website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Video WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your video website.' ),
					description: translate(
						"Launch your video website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Video WordPress Themes' ),
					header: translate( 'Choose premium themes for your video website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your video website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Video WordPress Themes' ),
					header: translate( 'Select partner themes for your video website.' ),
					description: translate(
						"Improve your video website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
					),
				},
			},
			'art-design': {
				all: {
					title: translate( 'Art and Design WordPress Themes' ),
					header: translate( 'Find the perfect theme for your art and design website.' ),
					description: translate(
						"Start your art and design website with the perfect theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				free: {
					title: translate( 'Free Art and Design WordPress Themes' ),
					header: translate( 'Discover the perfect free theme for your art and design website.' ),
					description: translate(
						"Launch your art and design website with the perfect free theme. Browse high-quality, professionally-designed options. Then, activate the one that's right for you."
					),
				},
				premium: {
					title: translate( 'Premium Art and Design WordPress Themes' ),
					header: translate( 'Choose premium themes for your art and design website.' ),
					description:
						/* translators: %(planName1)s, %(planName2)s, and %(planName3)s the short-hand version of the Premium, Business, and Commerce plan names */
						translate(
							"Enhance your art and design website with the perfect premium theme. Available on all %(planName1)s, %(planName2)s, and %(planName3)s plans. Activate the one that's right for you.",
							{
								args: {
									planName1: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
									planName2: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
									planName3: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
								},
							}
						),
				},
				marketplace: {
					title: translate( 'Partner Art and Design WordPress Themes' ),
					header: translate( 'Select partner themes for your art and design website.' ),
					description: translate(
						"Improve your art and design website with the perfect partner theme. Browse high-quality, professionally-designed options. Then, purchase the one that's right for you."
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
