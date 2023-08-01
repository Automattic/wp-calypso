import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_WOOEXPRESS_MEDIUM_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useMediaQuery } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import bestInClassHosting from 'calypso/assets/images/plans/wpcom/ecommerce-trial/best-in-class-hosting.svg';
import connect from 'calypso/assets/images/plans/wpcom/ecommerce-trial/connect.png';
import launch from 'calypso/assets/images/plans/wpcom/ecommerce-trial/launch.png';
import paymentCardChecked from 'calypso/assets/images/plans/wpcom/ecommerce-trial/payment-card-checked.svg';
import premiumThemes from 'calypso/assets/images/plans/wpcom/ecommerce-trial/premium-themes.svg';
import prioritySupport from 'calypso/assets/images/plans/wpcom/ecommerce-trial/priority-support.svg';
import promote from 'calypso/assets/images/plans/wpcom/ecommerce-trial/promote.png';
import securityPerformance from 'calypso/assets/images/plans/wpcom/ecommerce-trial/security-performance.svg';
import seoTools from 'calypso/assets/images/plans/wpcom/ecommerce-trial/seo-tools.svg';
import shipping from 'calypso/assets/images/plans/wpcom/ecommerce-trial/shipping2.png';
import simpleCustomization from 'calypso/assets/images/plans/wpcom/ecommerce-trial/simple-customization.svg';
import unlimitedProducts from 'calypso/assets/images/plans/wpcom/ecommerce-trial/unlimited-products.svg';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getECommerceTrialCheckoutUrl } from 'calypso/lib/trials/get-ecommerce-trial-checkout-url';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ECommerceTrialBanner from '../../ecommerce-trial/ecommerce-trial-banner';
import FeatureIncludedCard from '../feature-included-card';
import FeatureNotIncludedCard from '../feature-not-included-card';

import './style.scss';

const ECommerceTrialCurrentPlan = () => {
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );

	const translate = useTranslate();

	const [ showAllTrialFeaturesInMobileView, setShowAllTrialFeaturesInMobileView ] =
		useState( false );

	const viewAllIncludedFeatures = () => {
		setShowAllTrialFeaturesInMobileView( true );
	};

	const isMobile = useMediaQuery( '(max-width: 480px)' );
	const displayAllIncluded = ! isMobile || showAllTrialFeaturesInMobileView;

	const targetPlan = PLAN_WOOEXPRESS_MEDIUM_MONTHLY;

	/**
	 * Redirects to the checkout page with Plan on cart.
	 *
	 * @param ctaPosition - The position of the CTA that triggered the redirect.
	 */
	const goToCheckoutWithPlan = ( ctaPosition: string ) => {
		recordTracksEvent( `calypso_wooexpress_my_plan_cta`, {
			cta_position: ctaPosition,
		} );

		const checkoutUrl = getECommerceTrialCheckoutUrl( {
			productSlug: targetPlan,
			siteSlug: selectedSite?.slug ?? '',
		} );

		page.redirect( checkoutUrl );
	};

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
			title: translate( 'Premium themes' ),
			text: translate( 'Choose from a wide selection of beautifully designed themes.' ),
			illustration: premiumThemes,
			showButton: true,
			buttonText: translate( 'Browse premium themes' ),
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

	const whatsIncluded = displayAllIncluded
		? allIncludedFeatures
		: // Show only first 4 items
		  allIncludedFeatures.slice( 0, 4 );

	const whatsNotIncluded = [
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

	const bannerCallToAction = (
		<Button
			className="e-commerce-trial-current-plan__trial-card-cta"
			primary
			onClick={ () => goToCheckoutWithPlan( 'card' ) }
		>
			{ translate( 'Upgrade now' ) }
		</Button>
	);

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />

			<div className="e-commerce-trial-current-plan__banner-wrapper">
				<ECommerceTrialBanner callToAction={ bannerCallToAction } />
			</div>

			<h2 className="e-commerce-trial-current-plan__section-title">
				{ translate( 'What’s included in your free trial' ) }
			</h2>
			<div className="e-commerce-trial-current-plan__included-wrapper">
				{ whatsIncluded.map( ( feature ) => (
					<FeatureIncludedCard
						key={ feature.title }
						illustration={ feature.illustration }
						title={ feature.title }
						text={ feature.text }
						showButton={ false }
						buttonText={ feature.buttonText }
					></FeatureIncludedCard>
				) ) }

				{ ! displayAllIncluded && (
					<Button
						className="e-commerce-trial-current-plan__included-view-all"
						onClick={ viewAllIncludedFeatures }
					>
						{ translate( 'View all' ) }
					</Button>
				) }
			</div>

			<h2 className="e-commerce-trial-current-plan__section-title">
				{ translate( 'Ready to start selling?' ) }
			</h2>
			<p className="e-commerce-trial-current-plan__section-subtitle">
				{ translate(
					'Upgrade your free trial to launch your store and get the next-level features you need to grow.'
				) }
			</p>

			<div className="e-commerce-trial-current-plan__more-wrapper">
				{ whatsNotIncluded.map( ( feature ) => (
					<FeatureNotIncludedCard
						key={ feature.title }
						illustration={ feature.illustration }
						title={ feature.title }
						text={ feature.text }
					></FeatureNotIncludedCard>
				) ) }
			</div>

			<div className="e-commerce-trial-current-plan__cta-wrapper">
				<Button
					className="e-commerce-trial-current-plan__cta is-primary"
					onClick={ () => goToCheckoutWithPlan( 'footer' ) }
				>
					{ translate( 'Upgrade now' ) }
				</Button>
			</div>
		</>
	);
};

export default ECommerceTrialCurrentPlan;
