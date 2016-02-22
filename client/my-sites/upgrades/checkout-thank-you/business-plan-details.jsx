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
		<ul className="checkout-thank-you__purchase-details-list">
			{ showGetFreeDomainTip
			? <PurchaseDetail
					additionalClass="get-free-domain"
					title={ i18n.translate( 'Get a free domain' ) }
					description={ i18n.translate( 'WordPress.com Business includes a free domain for your site.' ) }
					buttonText={ i18n.translate( 'Add Free Domain' ) }
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
				title={ i18n.translate( 'Browse Themes' ) }
				description={ i18n.translate( 'Browse our collection of beautiful and amazing themes for your site.' ) }
				buttonText={ i18n.translate( 'Find a New Theme' ) }
				href={ '/design/' + selectedSite.slug } />

			<PurchaseDetail
				additionalClass="connect-google-analytics"
				title={ i18n.translate( 'Integrate Google Analytics' ) }
				description={ i18n.translate( 'Connect your site to your existing Google Analytics account.' ) }
				buttonText={ i18n.translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug } />
		</ul>
	);
};

BusinessPlanDetails.propTypes = {
	isFreeTrial: React.PropTypes.bool.isRequired,
	selectedSite: React.PropTypes.object.isRequired
};

export default BusinessPlanDetails;
