/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from './purchase-detail';

const PremiumPlanDetails = ( { isFreeTrial, selectedSite } ) => {
	var adminUrl = selectedSite.URL + '/wp-admin/',
		customizeLink = config.isEnabled( 'manage/customize' ) ? '/customize/' + selectedSite.slug : adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href ),
		showGetFreeDomainTip = ! isFreeTrial;

	return (
		<ul className="purchase-details-list">
			{ showGetFreeDomainTip
			? <PurchaseDetail
					additionalClass="get-free-domain"
					title={ i18n.translate( 'Get a free domain' ) }
					description={ i18n.translate( 'WordPress.com Premium includes a free domain for your site.' ) }
					buttonText={ i18n.translate( 'Add Free Domain' ) }
					href={ '/domains/add/' + selectedSite.slug } />
				: null
			}

			{ ! showGetFreeDomainTip
			? <PurchaseDetail
					additionalClass="ads-have-been-removed"
					title={ i18n.translate( 'Ads have been removed!' ) }
					description={ i18n.translate( 'WordPress.com ads will not show up on your blog.' ) }
					buttonText={ i18n.translate( 'View Your Site' ) }
					href={ selectedSite.URL }
					target="_blank" />
				: null
			}

			<PurchaseDetail
				additionalClass="customize-fonts-and-colors"
				title={ i18n.translate( 'Customize Fonts & Colors' ) }
				description={ i18n.translate( 'You now have access to full font and CSS editing capabilites.' ) }
				buttonText={ i18n.translate( 'Customize Your Site' ) }
				href={ customizeLink }
				target={ config.isEnabled( 'manage/customize' ) ? undefined : '_blank' } />

			<PurchaseDetail
				additionalClass="upload-to-videopress"
				title={ i18n.translate( 'Upload to VideoPress' ) }
				description={ i18n.translate( "Uploading videos to your blog couldn't be easier." ) }
				buttonText={ i18n.translate( 'Start Using VideoPress' ) }
				href={ selectedSite.URL + '/wp-admin/media-new.php' }
				target="_blank" />
		</ul>
	);
};

PremiumPlanDetails.propTypes = {
	isFreeTrial: React.PropTypes.bool.isRequired,
	selectedSite: React.PropTypes.object.isRequired
};

export default PremiumPlanDetails;
