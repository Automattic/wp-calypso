/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from './purchase-detail';

const BusinessPlanDetails = ( { isFreeTrial, selectedSite } ) => {
	const showGetFreeDomainTip = ! isFreeTrial;

	return (
		<div>
			{ showGetFreeDomainTip
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
					additionalClass="live-chat"
					title={ i18n.translate( 'Start a Live Chat' ) }
					description={ i18n.translate( 'Have a question? Chat live with WordPress.com Happiness Engineers.' ) }
					buttonText={ i18n.translate( 'Talk to an Operator' ) }
					href="//support.wordpress.com/live-chat/"
					target="_blank" />
			}

			<PurchaseDetail
				additionalClass="unlimited-premium-themes"
				title={ i18n.translate( 'Find a new theme' ) }
				description={ i18n.translate( 'All our premium themes, normally ranging $18 to $175 in price, are now available at no extra cost.' ) }
				buttonText={ i18n.translate( 'Browse premium themes' ) }
				href={ '/design/' + selectedSite.slug } />

			<PurchaseDetail
				additionalClass="connect-google-analytics"
				title={ i18n.translate( 'Stats from Google Analytics' ) }
				description={ i18n.translate( 'Connect to Google Analytics for the perfect complement to WordPress.com stats.' ) }
				buttonText={ i18n.translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug } />
		</div>
	);
};

BusinessPlanDetails.propTypes = {
	isFreeTrial: React.PropTypes.bool.isRequired,
	selectedSite: React.PropTypes.object.isRequired
};

export default BusinessPlanDetails;
