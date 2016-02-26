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
	const adminUrl = selectedSite.URL + '/wp-admin/',
		customizeLink = config.isEnabled( 'manage/customize' ) ? '/customize/' + selectedSite.slug : adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href ),
		showGetFreeDomainTip = ! isFreeTrial;

	return (
		<div>
			{
				showGetFreeDomainTip
				? <PurchaseDetail
						additionalClass="get-free-domain"
						title={ i18n.translate( 'Get your custom domain' ) }
						description={
							i18n.translate(
								"Replace your site's address, {{em}}%(siteDomain)s{{/em}}, with a custom domain. " +
								'A free domain is included with your plan.',
								{
									args: { siteDomain: selectedSite.domain },
									components: { em: <em /> }
								}
							)
						}
						buttonText={ i18n.translate( 'Claim your free domain' ) }
						href={ '/domains/add/' + selectedSite.slug } />
				: <PurchaseDetail
						additionalClass="ads-have-been-removed"
						title={ i18n.translate( 'Ads have been removed!' ) }
						description={ i18n.translate( 'WordPress.com ads will not show up on your blog.' ) }
						buttonText={ i18n.translate( 'View your site' ) }
						href={ selectedSite.URL }
						target="_blank" />
			}

			<PurchaseDetail
				additionalClass="customize-fonts-and-colors"
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

			<PurchaseDetail
				additionalClass="upload-to-videopress"
				title={ i18n.translate( 'Video and audio posts' ) }
				description={
					i18n.translate(
						'Enrich your posts with video and audio, uploaded directly on your site. ' +
						'No ads or limits. The Premium plan also adds 10GB of file storage.'
					)
				}
				buttonText={ i18n.translate( 'Start a new post' ) }
				href={ '/post/' + selectedSite.slug } />

		</div>
	);
};

PremiumPlanDetails.propTypes = {
	isFreeTrial: React.PropTypes.bool.isRequired,
	selectedSite: React.PropTypes.object.isRequired
};

export default PremiumPlanDetails;
