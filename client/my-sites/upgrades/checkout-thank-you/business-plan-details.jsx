/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from 'components/purchase-detail';

const BusinessPlanDetails = ( { selectedSite } ) => {
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
				title={ i18n.translate( 'Find a new theme' ) }
				description={ i18n.translate( 'All our premium themes are now available at no extra cost. Try them out now.' ) }
				buttonText={ i18n.translate( 'Browse premium themes' ) }
				href={ '/design/' + selectedSite.slug } />

			<PurchaseDetail
				icon="stats-alt"
				title={ i18n.translate( 'Stats from Google Analytics' ) }
				description={ i18n.translate( 'Connect to Google Analytics for the perfect complement to WordPress.com stats.' ) }
				buttonText={ i18n.translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug } />
		</div>
	);
};

BusinessPlanDetails.propTypes = {
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired
};

export default BusinessPlanDetails;
