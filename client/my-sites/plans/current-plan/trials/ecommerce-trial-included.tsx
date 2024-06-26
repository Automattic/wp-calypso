import { localize, translate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import bestInClassHosting from 'calypso/assets/images/plans/wpcom/ecommerce-trial/best-in-class-hosting.svg';
import paymentCardChecked from 'calypso/assets/images/plans/wpcom/ecommerce-trial/payment-card-checked.svg';
import premiumThemes from 'calypso/assets/images/plans/wpcom/ecommerce-trial/premium-themes.svg';
import prioritySupport from 'calypso/assets/images/plans/wpcom/ecommerce-trial/priority-support.svg';
import securityPerformance from 'calypso/assets/images/plans/wpcom/ecommerce-trial/security-performance.svg';
import seoTools from 'calypso/assets/images/plans/wpcom/ecommerce-trial/seo-tools.svg';
import simpleCustomization from 'calypso/assets/images/plans/wpcom/ecommerce-trial/simple-customization.svg';
import unlimitedProducts from 'calypso/assets/images/plans/wpcom/ecommerce-trial/unlimited-products.svg';
import FeatureIncludedCard from '../feature-included-card';

interface Props {
	translate: typeof translate;
	displayAll: boolean;
	isWooExpressTrial?: boolean;
}
const ECommerceTrialIncluded: FunctionComponent< Props > = ( props ) => {
	const { translate, displayAll = true, isWooExpressTrial } = props;

	// TODO: translate when final copy is available
	const allIncludedFeatures = [
		{
			title: translate( 'Priority support' ),
			text: translate( 'Need help? Reach out to us anytime, anywhere.' ),
			illustration: prioritySupport,
			showButton: true,
			buttonText: translate( 'Ask a question' ),
		},
		{
			title: translate( 'Beautiful themes' ),
			text: translate( 'Choose from a wide selection of beautifully designed themes.' ),
			illustration: premiumThemes,
			showButton: true,
			buttonText: translate( 'Browse beautiful themes' ),
		},
		{
			title: translate( 'Simple customization' ),
			text: translate(
				"Change your store's look and feel, update your cart and checkout pages, and more."
			),
			illustration: simpleCustomization,
			showButton: true,
			buttonText: translate( 'Design your store' ),
		},
		{
			title: translate( 'Unlimited products' ),
			text: translate(
				"Create as many products or services as you'd like, including subscriptions."
			),
			illustration: unlimitedProducts,
			showButton: true,
			buttonText: translate( 'Add a product' ),
		},
		{
			title: translate( 'Security & performance' ),
			text: translate( 'Get auto real-time backups, malware scans, and spam protection.' ),
			illustration: securityPerformance,
			showButton: true,
			buttonText: translate( 'Keep your store safe' ),
		},
		{
			title: translate( 'SEO tools' ),
			text: translate(
				'Boost traffic with tools that make your content more findable on search engines.'
			),
			illustration: seoTools,
			showButton: true,
			buttonText: translate( 'Increase visibility' ),
		},
		{
			title: translate( 'Get ready to be paid' ),
			text: translate( 'Set up one (or more!) payment methods and test your checkout process.' ),
			illustration: paymentCardChecked,
			showButton: true,
			buttonText: translate( 'Get ready to take payments' ),
		},
		{
			title: translate( 'Best-in-class hosting' ),
			text: translate( 'We take care of hosting your store so you can focus on selling.' ),
			illustration: bestInClassHosting,
			showButton: false,
		},
	];

	const whatsIncluded = displayAll
		? allIncludedFeatures
		: // Show only first 4 items
		  allIncludedFeatures.slice( 0, 4 );

	return (
		<>
			{ whatsIncluded.map( ( feature ) => (
				<FeatureIncludedCard
					key={ feature.title }
					illustration={ isWooExpressTrial ? feature.illustration : undefined }
					title={ feature.title }
					text={ feature.text }
					showButton={ false }
					buttonText={ feature.buttonText }
					reducedPadding={ ! isWooExpressTrial }
				></FeatureIncludedCard>
			) ) }
		</>
	);
};

export default localize( ECommerceTrialIncluded );
