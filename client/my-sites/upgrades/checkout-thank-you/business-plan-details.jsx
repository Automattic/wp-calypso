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
	var showGetFreeDomainTip = ! isFreeTrial;

	return (
		<ul className="purchase-details-list">
			{ showGetFreeDomainTip
			? <PurchaseDetail
					additionalClass="get-free-domain"
					title={ i18n.translate( 'Get a free domain' ) }
					description={ i18n.translate( 'WordPress.com Business includes a free domain for your site.' ) }
					buttonText={ i18n.translate( 'Add Free Domain' ) }
					href={ '/domains/add/' + selectedSite.slug } />
				: null }

			<PurchaseDetail
				additionalClass="ecommerce"
				title={ i18n.translate( 'Add eCommerce' ) }
				description={ i18n.translate( 'Connect your Ecwid or Shopify store with your WordPress.com site.' ) }
				buttonText={ i18n.translate( 'Set Up eCommerce' ) }
				href={ '/plugins/' + selectedSite.slug } />

			{ ! showGetFreeDomainTip
			? <PurchaseDetail
					additionalClass="live-chat"
					title={ i18n.translate( 'Start a Live Chat' ) }
					description={ i18n.translate( 'Have a question? Chat live with WordPress.com Happiness Engineers.' ) }
					buttonText={ i18n.translate( 'Talk to an Operator' ) }
					href="//support.wordpress.com/live-chat/"
					target="_blank" />
				: null
			}

			<PurchaseDetail
				additionalClass="unlimited-premium-themes"
				title={ i18n.translate( 'Browse Themes' ) }
				description={ i18n.translate( 'Browse our collection of beautiful and amazing themes for your site.' ) }
				buttonText={ i18n.translate( 'Find a New Theme' ) }
				href={ '/design/' + selectedSite.slug } />
		</ul>
	);
};

BusinessPlanDetails.propTypes = {
	isFreeTrial: React.PropTypes.bool.isRequired,
	selectedSite: React.PropTypes.object.isRequired
};

export default BusinessPlanDetails;
