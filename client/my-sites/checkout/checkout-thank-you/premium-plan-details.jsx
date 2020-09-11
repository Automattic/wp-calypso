/**
 * External dependencies
 */
import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { isPremium, isGoogleApps } from 'lib/products-values';
import { newPost } from 'lib/paths';
import PurchaseDetail from 'components/purchase-detail';

/**
 * Image dependencies
 */
import analyticsImage from 'assets/images/illustrations/google-analytics.svg';
import advertisingRemovedImage from 'assets/images/upgrades/removed-advertising.svg';
import customizeThemeImage from 'assets/images/upgrades/customize-theme.svg';
import mediaPostImage from 'assets/images/upgrades/media-post.svg';
import wordAdsImage from 'assets/images/upgrades/word-ads.svg';

const PremiumPlanDetails = ( {
	selectedSite,
	sitePlans,
	selectedFeature,
	purchases,
	customizeUrl,
} ) => {
	const translate = useTranslate();
	const plan = find( sitePlans.data, isPremium ),
		isPremiumPlan = isPremium( selectedSite.plan );
	const googleAppsWasPurchased = purchases.some( isGoogleApps );

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails purchases={ purchases } /> }

			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon={
					<img
						alt={ translate( 'Advertising Removed Illustration' ) }
						src={ advertisingRemovedImage }
					/>
				}
				title={ translate( 'Advertising Removed' ) }
				description={
					isPremiumPlan
						? translate(
								'With your plan, all WordPress.com advertising has been removed from your site.' +
									' You can upgrade to a Business plan to also remove the WordPress.com footer credit.'
						  )
						: translate(
								'With your plan, all WordPress.com advertising has been removed from your site.'
						  )
				}
			/>

			<PurchaseDetail
				icon={ <img alt="" src={ analyticsImage } /> }
				title={ translate( 'Connect to Google Analytics' ) }
				description={ translate(
					"Complement WordPress.com's stats with Google's in-depth look at your visitors and traffic patterns."
				) }
				buttonText={ translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug }
			/>

			{ ! selectedFeature && (
				<PurchaseDetail
					icon={
						<img alt={ translate( 'Customize Theme Illustration' ) } src={ customizeThemeImage } />
					}
					title={ translate( 'Customize your theme' ) }
					description={ translate(
						"You now have direct control over your site's fonts and colors in the customizer. " +
							"Change your site's entire look in a few clicks."
					) }
					buttonText={ translate( 'Start customizing' ) }
					href={ customizeUrl }
				/>
			) }

			<PurchaseDetail
				icon={
					<img alt={ translate( 'Add Media to Your Posts Illustration' ) } src={ mediaPostImage } />
				}
				title={ translate( 'Video and audio posts' ) }
				description={ translate(
					'Enrich your posts with video and audio, uploaded directly on your site. ' +
						'No ads. The Premium plan offers 13GB of file storage.'
				) }
				buttonText={ translate( 'Start a new post' ) }
				href={ newPost( selectedSite ) }
			/>
			{ isWordadsInstantActivationEligible( selectedSite ) && (
				<PurchaseDetail
					icon={ <img alt={ translate( 'WordAds Illustration' ) } src={ wordAdsImage } /> }
					title={ translate( 'Easily monetize your site' ) }
					description={ translate(
						'Take advantage of WordAds instant activation on your upgraded site. ' +
							'WordAds lets you earn money by displaying promotional content.'
					) }
					buttonText={ translate( 'Start Earning' ) }
					href={ '/ads/settings/' + selectedSite.slug }
				/>
			) }
		</div>
	);
};

PremiumPlanDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	selectedFeature: PropTypes.object,
	sitePlans: PropTypes.object.isRequired,
};

export default PremiumPlanDetails;
