/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import i18n from 'lib/mixins/i18n';
import paths from 'lib/paths';
import PurchaseDetail from 'components/purchase-detail';

const PremiumPlanDetails = ( { selectedSite } ) => {
	const adminUrl = selectedSite.URL + '/wp-admin/',
		customizeLink = config.isEnabled( 'manage/customize' ) ? '/customize/' + selectedSite.slug : adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href );

	return (
		<div>
			<PurchaseDetail
				icon="globe"
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
	] ).isRequired
};

export default PremiumPlanDetails;
