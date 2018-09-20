/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';
import GoogleVoucherDetails from './google-voucher';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { isPremium, isGoogleApps } from 'lib/products-values';
import { newPost } from 'lib/paths';
import PurchaseDetail from 'components/purchase-detail';
import QuerySiteVouchers from 'components/data/query-site-vouchers';

const PremiumPlanDetails = ( { selectedSite, sitePlans, selectedFeature, purchases } ) => {
	const adminUrl = selectedSite.URL + '/wp-admin/';
	const customizerInAdmin =
		adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href );
	const customizeLink = config.isEnabled( 'manage/customize' )
		? '/customize/' + selectedSite.slug
		: customizerInAdmin;
	const plan = find( sitePlans.data, isPremium ),
		isPremiumPlan = isPremium( selectedSite.plan );
	const googleAppsWasPurchased = purchases.some( isGoogleApps );

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails isRequired /> }

			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/upgrades/advertising-removed.svg" /> }
				title={ i18n.translate( 'Advertising Removed' ) }
				description={
					isPremiumPlan
						? i18n.translate(
								'With your plan, all WordPress.com advertising has been removed from your site.' +
									' You can upgrade to a Business plan to also remove the WordPress.com footer credit.'
						  )
						: i18n.translate(
								'With your plan, all WordPress.com advertising has been removed from your site.'
						  )
				}
			/>

			<QuerySiteVouchers siteId={ selectedSite.ID } />
			<div>
				<GoogleVoucherDetails selectedSite={ selectedSite } />
			</div>

			{ ! selectedFeature && (
				<PurchaseDetail
					icon={ <img alt="" src="/calypso/images/upgrades/customize-theme.svg" /> }
					title={ i18n.translate( 'Customize your theme' ) }
					description={ i18n.translate(
						"You now have direct control over your site's fonts and colors in the customizer. " +
							"Change your site's entire look in a few clicks."
					) }
					buttonText={ i18n.translate( 'Start customizing' ) }
					href={ customizeLink }
					target={ config.isEnabled( 'manage/customize' ) ? undefined : '_blank' }
				/>
			) }

			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/upgrades/media-post.svg" /> }
				title={ i18n.translate( 'Video and audio posts' ) }
				description={ i18n.translate(
					'Enrich your posts with video and audio, uploaded directly on your site. ' +
						'No ads or limits. The Premium plan also adds 10GB of file storage.'
				) }
				buttonText={ i18n.translate( 'Start a new post' ) }
				href={ newPost( selectedSite ) }
			/>
			{ isWordadsInstantActivationEligible( selectedSite ) && (
				<PurchaseDetail
					icon={ <img alt="" src="/calypso/images/upgrades/word-ads.svg" /> }
					title={ i18n.translate( 'Easily monetize your site' ) }
					description={ i18n.translate(
						'Take advantage of WordAds instant activation on your upgraded site. ' +
							'WordAds lets you earn money by displaying promotional content.'
					) }
					buttonText={ i18n.translate( 'Start Earning' ) }
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
