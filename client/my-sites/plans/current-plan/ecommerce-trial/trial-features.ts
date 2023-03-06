import { HelpCenter } from '@automattic/data-stores';
import { dispatch as dataStoreDispatch } from '@wordpress/data';
import { translate as i18nTranslate } from 'i18n-calypso';
import bestInClassHosting from 'calypso/assets/images/plans/wpcom/ecommerce-trial/best-in-class-hosting.svg';
import connect from 'calypso/assets/images/plans/wpcom/ecommerce-trial/connect.png';
import launch from 'calypso/assets/images/plans/wpcom/ecommerce-trial/launch.png';
import premiumThemes from 'calypso/assets/images/plans/wpcom/ecommerce-trial/premium-themes.svg';
import prioritySupport from 'calypso/assets/images/plans/wpcom/ecommerce-trial/priority-support.svg';
import promote from 'calypso/assets/images/plans/wpcom/ecommerce-trial/promote.png';
import shipping from 'calypso/assets/images/plans/wpcom/ecommerce-trial/shipping2.png';
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
			id: 'premium-themes',
			title: translate( 'Premium themes' ),
			text: translate(
				'Find a theme that fits your business from our premium selection, and customize it to reflect your brand.'
			),
			illustration: premiumThemes,
			showButton: true,
			buttonText: translate( 'Browse themes' ),
			getHref: ( { siteSlug }: GetFeatureHrefProps ) => `/themes/${ siteSlug }`,
		},
		{
			id: 'product-customization',
			title: translate( 'Product customization' ),
			text: translate(
				'Get ready for launch by adding products with powerful tools like bundling and smart, data-driven upsells.'
			),
			illustration: unlimitedProducts,
			showButton: true,
			buttonText: translate( 'Add a product' ),
			getHref: ( { wpAdminUrl }: GetFeatureHrefProps ) =>
				`${ wpAdminUrl }post-new.php?post_type=product&tutorial=true`,
		},
		{
			id: 'accept-payments',
			title: translate( 'Get ready to accept payments' ),
			text: translate(
				'Set up one (or more!) payment methods and get your checkout process ready for launch.'
			),
			illustration: '',
			showButton: true,
			buttonText: translate( 'Get ready to take payments' ),
			getHref: ( { wpAdminUrl }: GetFeatureHrefProps ) =>
				`${ wpAdminUrl }admin.php?page=wc-admin&task=payments`,
		},
		{
			id: 'email-automation',
			title: translate( 'Email automation' ),
			text: translate(
				'Get your automated customer emails set up and ready to send for when you launch.'
			),
			illustration: '',
			showButton: true,
			buttonText: translate( 'Set up emails' ),
			getHref: ( { wpAdminUrl }: GetFeatureHrefProps ) =>
				`${ wpAdminUrl }edit.php?post_type=aw_workflow#presets`,
		},
		{
			id: 'ecommerce-toolkit',
			title: translate( 'Your full ecommerce toolkit' ),
			text: translate(
				'Everything you need to create a beautiful store and be ready to sell anything, anywhere.'
			),
			illustration: '',
			showButton: false,
		},
		{
			id: 'hosting',
			title: translate( 'Best-in-class hosting' ),
			text: translate( 'We take care of hosting your store so you can focus on selling.' ),
			illustration: bestInClassHosting,
			showButton: false,
		},
		{
			id: 'own-store',
			title: translate( 'A store you own' ),
			text: translate(
				'Run your store however you’d like, customize every part of it, and even move it – it’s yours.'
			),
			illustration: '',
			showButton: false,
		},
		{
			id: 'support',
			title: translate( 'Priority support' ),
			text: translate(
				'Need a helping hand? Our friendly team of experts are on hand, 24 hours a day, 7 days a week.'
			),
			illustration: prioritySupport,
			showButton: true,
			buttonText: translate( 'Ask a question' ),
			onButtonClick: () => {
				const HELP_CENTER_STORE = HelpCenter.register();
				dataStoreDispatch( HELP_CENTER_STORE ).setShowHelpCenter( true );
			},
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
