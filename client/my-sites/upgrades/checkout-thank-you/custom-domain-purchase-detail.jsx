/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

const CustomDomainPurchaseDetail = ( { selectedSite } ) => {
	return (
		<PurchaseDetail
			icon="globe"
			title={ i18n.translate( 'Get your custom domain' ) }
			description={
				i18n.translate(
					"Replace your site's address, {{em}}%(siteDomain)s{{/em}}, with a custom domain. " +
					'A free domain is included with your plan.',
					{
						args: { siteDomain: selectedSite.slug },
						components: { em: <em /> }
					}
				)
			}
			buttonText={ i18n.translate( 'Claim your free domain' ) }
			href={ '/domains/add/' + selectedSite.slug } />
	);
};

CustomDomainPurchaseDetail.propTypes = {
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired
};

export default CustomDomainPurchaseDetail;
