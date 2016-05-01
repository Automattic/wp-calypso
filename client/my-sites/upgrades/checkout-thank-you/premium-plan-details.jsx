/**
 * External dependencies
 */
import find from 'lodash/find';
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import i18n from 'lib/mixins/i18n';
import { isPremium } from 'lib/products-values';
import paths from 'lib/paths';
import PurchaseDetail from 'components/purchase-detail';

const PremiumPlanDetails = ( { selectedSite, sitePlans, selectedFeature } ) => {
	const adminUrl = selectedSite.URL + '/wp-admin/',
		customizeLink = config.isEnabled( 'manage/customize' ) ? '/customize/' + selectedSite.slug : adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href ),
		plan = find( sitePlans.data, isPremium );

	return (
		<div>
			{ plan.hasDomainCredit && <CustomDomainPurchaseDetail selectedSite={ selectedSite } /> }

			<PurchaseDetail
				icon="speaker"
				title={ i18n.translate( 'No Ads' ) }
				description={
					i18n.translate(
						'Premium plan automatically removes all Ads from your site. ' +
						'Now your visitors can enjoy your great content without distractions!'
					)
				}
			/>

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
