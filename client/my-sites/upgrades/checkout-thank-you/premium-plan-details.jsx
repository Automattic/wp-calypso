/**
 * External dependencies
 */
import find from 'lodash/find';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleVoucherDetails from './google-voucher';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { isPremium } from 'lib/products-values';
import paths from 'lib/paths';
import PurchaseDetail from 'components/purchase-detail';
import QuerySiteVouchers from 'components/data/query-site-vouchers';

const PremiumPlanDetails = ( { selectedSite, sitePlans, selectedFeature } ) => {
	const adminUrl = selectedSite.URL + '/wp-admin/';
	const customizerInAdmin = adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href );
	const customizeLink = config.isEnabled( 'manage/customize' ) ? '/customize/' + selectedSite.slug : customizerInAdmin;
	const plan = find( sitePlans.data, isPremium ),
		isPremiumPlan = isPremium( selectedSite.plan );

	return (
		<div>
			{ plan.hasDomainCredit && <CustomDomainPurchaseDetail selectedSite={ selectedSite } /> }

			<PurchaseDetail
				icon="speaker"
				title={ i18n.translate( 'Advertising Removed' ) }
				description={ isPremiumPlan
					? i18n.translate( 'With your plan, all WordPress.com advertising has been removed from your site.' +
						' You can upgrade to a Business plan to also remove the WordPress.com footer credit.' )
					: i18n.translate( 'With your plan, all WordPress.com advertising has been removed from your site.' )
				}
			/>

			<QuerySiteVouchers siteId={ selectedSite.ID } />
			<div>
				<GoogleVoucherDetails selectedSite={ selectedSite } />
			</div>

			{ ! selectedFeature &&
				<PurchaseDetail
					icon="customize"
					title={ i18n.translate( 'Customize your theme' ) }
					description={
						i18n.translate(
							"You now have direct control over your site's fonts and colors in the customizer. " +
							"Change your site's entire look in a few clicks."
						)
					}
					buttonText={ i18n.translate( 'Start customizing' ) }
					href={ customizeLink }
					target={ config.isEnabled( 'manage/customize' ) ? undefined : '_blank' } />
			}

			<PurchaseDetail
				icon="image-multiple"
				title={ i18n.translate( 'Video and audio posts' ) }
				description={
					i18n.translate(
						'Enrich your posts with video and audio, uploaded directly on your site. ' +
						'No ads or limits. The Premium plan also adds 10GB of file storage.'
					)
				}
				buttonText={ i18n.translate( 'Start a new post' ) }
				href={ paths.newPost( selectedSite ) } />
			{
				isWordadsInstantActivationEligible( selectedSite ) &&
				<PurchaseDetail
					icon="speaker"
					title={ i18n.translate( 'Easily monetize your site' ) }
					description={
						i18n.translate(
							'Take advantage of WordAds instant activation on your upgraded site. ' +
							'WordAds lets you earn money by displaying promotional content.'
						)
					}
					buttonText={ i18n.translate( 'Start Earning' ) }
					href={ '/ads/settings/' + selectedSite.slug } />
			}
		</div>
	);
};

PremiumPlanDetails.propTypes = {
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired,
	selectedFeature: React.PropTypes.object,
	sitePlans: React.PropTypes.object.isRequired
};

export default PremiumPlanDetails;
