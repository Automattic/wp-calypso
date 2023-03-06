import { HelpCenter } from '@automattic/data-stores';
import { dispatch as dataStoreDispatch } from '@wordpress/data';
import { translate as i18nTranslate } from 'i18n-calypso';
import bestInClassHosting from 'calypso/assets/images/plans/wpcom/ecommerce-trial/best-in-class-hosting.svg';
import connect from 'calypso/assets/images/plans/wpcom/ecommerce-trial/connect.png';
import googleAnalytics from 'calypso/assets/images/plans/wpcom/ecommerce-trial/google-analytics.svg';
import launch from 'calypso/assets/images/plans/wpcom/ecommerce-trial/launch.png';
import premiumThemes from 'calypso/assets/images/plans/wpcom/ecommerce-trial/premium-themes.svg';
import prioritySupport from 'calypso/assets/images/plans/wpcom/ecommerce-trial/priority-support.svg';
import promote from 'calypso/assets/images/plans/wpcom/ecommerce-trial/promote.png';
import securityPerformance from 'calypso/assets/images/plans/wpcom/ecommerce-trial/security-performance.svg';
import seoTools from 'calypso/assets/images/plans/wpcom/ecommerce-trial/seo-tools.svg';
import shipping from 'calypso/assets/images/plans/wpcom/ecommerce-trial/shipping2.png';
import simpleCustomization from 'calypso/assets/images/plans/wpcom/ecommerce-trial/simple-customization.svg';
import unlimitedProducts from 'calypso/assets/images/plans/wpcom/ecommerce-trial/unlimited-products.svg';
import type { TranslateResult } from 'i18n-calypso';

interface TrialFeaturesProps {
	translate: typeof i18nTranslate;
}

export interface GetFeatureHrefProps {
	siteSlug: string;
	wpAdminUrl: string;
}

export interface IncludedFeatures {
	id: string;
	title: TranslateResult;
	text: TranslateResult;
	illustration: string;
	showButton: boolean;
	buttonText?: TranslateResult;
	onButtonClick?: () => void;
	getHref?: ( getHrefProps: GetFeatureHrefProps ) => string;
}

export const includedFeatures = ( { translate }: TrialFeaturesProps ): IncludedFeatures[] => {
	return [
		{
			id: 'support',
			title: translate( 'Priority support' ),
			text: translate( 'Need help? Reach out to us anytime, anywhere.' ),
			illustration: prioritySupport,
			showButton: true,
			buttonText: translate( 'Ask a question' ),
			onButtonClick: () => {
				const HELP_CENTER_STORE = HelpCenter.register();
				dataStoreDispatch( HELP_CENTER_STORE ).setShowHelpCenter( true );
			},
		},
		{
			id: 'premium-themes',
			title: translate( 'Premium themes' ),
			text: translate( 'Choose from a wide selection of beautifully designed themes.' ),
			illustration: premiumThemes,
			showButton: true,
			buttonText: translate( 'Browse premium themes' ),
			getHref: ( { siteSlug }: GetFeatureHrefProps ) => `/themes/${ siteSlug }`,
		},
		{
			id: 'customization',
			title: translate( 'Simple customization' ),
			text: translate(
				"Change your store's look and feel, update your cart and checkout pages, and more."
			),
			illustration: simpleCustomization,
			showButton: true,
			buttonText: translate( 'Design your store' ),
			getHref: ( { wpAdminUrl }: GetFeatureHrefProps ) => `${ wpAdminUrl }site-editor.php`,
		},
		{
			id: 'unlimited-products',
			title: translate( 'Unlimited products' ),
			text: translate(
				"Create as many products or services as you'd like, including subscriptions."
			),
			illustration: unlimitedProducts,
			showButton: true,
			buttonText: translate( 'Add a product' ),
			getHref: ( { wpAdminUrl }: GetFeatureHrefProps ) =>
				`${ wpAdminUrl }post-new.php?post_type=product&tutorial=true`,
		},
		{
			id: 'security-backups',
			title: translate( 'Security & performance' ),
			text: translate( 'Get auto real-time backups, malware scans, and spam protection.' ),
			illustration: securityPerformance,
			showButton: true,
			buttonText: translate( 'Keep your store safe' ),
			getHref: ( { siteSlug }: GetFeatureHrefProps ) => `/backup/${ siteSlug }`,
		},
		{
			id: 'seo-tools',
			title: translate( 'SEO tools' ),
			text: translate(
				'Boost traffic with tools that make your content more findable on search engines.'
			),
			illustration: seoTools,
			showButton: true,
			buttonText: translate( 'Increase visibility' ),
			getHref: ( { siteSlug }: GetFeatureHrefProps ) => `/marketing/traffic/${ siteSlug }`,
		},
		{
			id: 'google-analytics',
			title: translate( 'Google Analytics' ),
			text: translate( "See where your visitors come from and what they're doing on your store." ),
			illustration: googleAnalytics,
			showButton: true,
			buttonText: translate( 'Connect Google Analytics' ),
			getHref: ( { siteSlug }: GetFeatureHrefProps ) =>
				`/marketing/traffic/${ siteSlug }#analytics`,
		},
		{
			id: 'hosting',
			title: translate( 'Best-in-class hosting' ),
			text: translate( 'We take care of hosting your store so you can focus on selling.' ),
			illustration: bestInClassHosting,
			showButton: false,
		},
	];
};

export const notIncludedFeatures = ( { translate }: TrialFeaturesProps ) => {
	return [
		{
			title: translate( 'Launch your store to the world' ),
			text: translate( 'Once you upgrade, you can publish your store and start taking orders.' ),
			illustration: launch,
		},
		{
			title: translate( 'Promote your products' ),
			text: translate(
				'Advertise and sell on popular marketplaces and social media platforms using your product catalog.'
			),
			illustration: promote,
		},
		{
			title: translate( 'Connect with your customers' ),
			text: translate(
				'Get access to email features that let you communicate with your customers and prospects.'
			),
			illustration: connect,
		},
		{
			title: translate( 'Integrate top shipping carriers' ),
			text: translate(
				'Customize your shipping rates, print labels right from your store, and more.'
			),
			illustration: shipping,
		},
	];
};
