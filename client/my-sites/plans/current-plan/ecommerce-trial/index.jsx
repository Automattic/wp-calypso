import { Button, Card } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useMediaQuery } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import DoughnutChart from '../../doughnut-chart';
import FeatureIncludedCard from '../feature-included-card';
import FeatureNotIncludedCard from '../feature-not-included-card';

import './style.scss';

export default function ECommerceTrialCurrentPlan( props ) {
	const { currentPlan, eCommerceTrialDaysLeft, eCommerceTrialExpiration, isTrialExpired } = props;

	const locale = useLocale();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const [ showAllTrialFeaturesInMobileView, setShowAllTrialFeaturesInMobileView ] =
		useState( false );

	const viewAllIncludedFeatures = () => {
		setShowAllTrialFeaturesInMobileView( true );
	};

	const isMobile = useMediaQuery( '(max-width: 480px)' );
	const displayAllIncluded = ! isMobile || showAllTrialFeaturesInMobileView;

	const allIncludedFeatures = [
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/priority-support.svg',
			title: translate( 'Priority support' ),
			text: translate( 'Need help? Reach out to us anytime, anywhere.' ),
			showButton: true,
			buttonText: translate( 'Ask a question' ),
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/premium-themes.svg',
			title: translate( 'Premium themes' ),
			text: translate( 'Explore a diverse selection of beautifully designed premium themes.' ),
			showButton: true,
			buttonText: translate( 'Browse premium themes' ),
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/advanced-customization.svg',
			title: translate( 'Advanced customization' ),
			text: translate( "Change your store's appearance in a few clicks!" ),
			showButton: true,
			buttonText: translate( 'Design your store' ),
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/unlimited-products.svg',
			title: translate( 'Unlimited products' ),
			text: translate( 'List as many products or services as you’d like and offer subscriptions.' ),
			showButton: true,
			buttonText: translate( 'Add a product' ),
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/jetpack-features.svg',
			title: translate( 'Jetpack features' ),
			text: translate( 'Get auto real-time backups, malware scans, and spam protection.' ),
			showButton: true,
			buttonText: translate( 'Keep your store safe' ),
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/seo-tools.svg',
			title: translate( 'SEO tools' ),
			text: translate(
				'Boost traffic with tools that make your content more findable on search engines.'
			),
			showButton: true,
			buttonText: translate( 'Increase visibility' ),
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/google-analytics.svg',
			title: translate( 'Google Analytics' ),
			text: translate(
				'Understand visitors and traffic patterns more in depht with Google stats.'
			),
			showButton: true,
			buttonText: translate( 'Connect Google Analytics' ),
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/best-in-class-hosting.svg',
			title: translate( 'Best-in-class hosting' ),
			text: translate(
				'Hosting is included with your plan, eliminating additional cost and technical hassle.'
			),
			showButton: false,
		},
	];

	const whatsIncluded = displayAllIncluded
		? allIncludedFeatures
		: // Show only first 4 items
		  allIncludedFeatures.slice( 0, 4 );

	const whatsNotIncluded = [
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/launch.png',
			title: translate( 'Launch your store to the world' ),
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/themes.png',
			title: translate( 'Access all premium themes' ),
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/money.png',
			title: translate( 'Sell your products' ),
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/email.png',
			title: translate( 'Connect with your customers' ),
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/promote.png',
			title: translate( 'Promote your products' ),
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
		},
		{
			illustration: '/calypso/images/plans/wpcom/ecommerce-trial/shipping.png',
			title: translate( 'Integrate top shipping carriers' ),
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
		},
	];

	const trialStart = moment( currentPlan?.subscribedDate );
	const trialEnd = moment( currentPlan?.expiryDate );
	const trialDuration = trialEnd.diff( trialStart, 'days' );

	/**
	 * Trial progress from 0 to 1
	 */
	const trialProgress = 1 - eCommerceTrialDaysLeft / trialDuration;
	const eCommerceTrialDaysLeftToDisplay = isTrialExpired ? 0 : eCommerceTrialDaysLeft;

	// moment.js doesn't have a format option to display the long form in a localized way without the year
	// https://github.com/moment/moment/issues/3341
	const readableExpirationDate = eCommerceTrialExpiration?.toDate().toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
	} );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'is-trial-plan' ] } />

			<Card className="e-commerce-trial-current-plan__trial-card">
				<div className="e-commerce-trial-current-plan__trial-card-content">
					<p className="e-commerce-trial-current-plan__card-title">
						{ translate( 'You’re in a free trial' ) }
					</p>
					<p className="e-commerce-trial-current-plan__card-subtitle">
						{ isTrialExpired
							? translate(
									'Your free trial has expired. Sign up to a plan to unlock new features and keep your store running.'
							  )
							: translate(
									'Your free trial will end in %(daysLeft)d day. Sign up to a plan by %(expirationdate)s to unlock new features and keep your store running.',
									'Your free trial will end in %(daysLeft)d days. Sign up to a plan by %(expirationdate)s to unlock new features and keep your store running.',
									{
										count: eCommerceTrialDaysLeft,
										args: {
											daysLeft: eCommerceTrialDaysLeft,
											expirationdate: readableExpirationDate,
										},
									}
							  ) }
					</p>
					<Button className="e-commerce-trial-current-plan__trial-card-cta" primary>
						{ translate( 'Get Commerce' ) }
					</Button>
				</div>
				<div className="plans__chart-wrapper">
					<DoughnutChart progress={ trialProgress } text={ eCommerceTrialDaysLeftToDisplay } />
					<br />
					<span className="plans__chart-label">
						{ isTrialExpired
							? translate( 'Your free trial has expired' )
							: translate( 'day left in trial', 'days left in trial', {
									count: eCommerceTrialDaysLeft,
							  } ) }
					</span>
				</div>
			</Card>

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
						showButton={ feature.showButton }
						buttonText={ feature.buttonText }
					></FeatureIncludedCard>
				) ) }

				{ displayAllIncluded && (
					<Button
						className="e-commerce-trial-current-plan__included-view-all"
						onClick={ viewAllIncludedFeatures }
					>
						{ translate( 'View all' ) }
					</Button>
				) }
			</div>

			<h2 className="e-commerce-trial-current-plan__section-title">
				{ translate( 'Do you want more?' ) }
			</h2>
			<p className="e-commerce-trial-current-plan__section-subtitle">
				{ translate( 'The free trial doesn’t support the following features.' ) }
				<br />
				{ translate( 'Get the most value out of WooCommerce and get Pro.' ) }
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
				<Button className="e-commerce-trial-current-plan__cta is-primary">
					{ translate( 'Enhance your store and get Commerce' ) }
				</Button>
			</div>
		</>
	);
}
