/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import { hasCustomDomain } from 'lib/site/utils';

const CustomDomainPurchaseDetail = ( { selectedSite, hasDomainCredit, translate } ) => {
	if ( hasDomainCredit && selectedSite.plan.user_is_owner ) {
		return ( <PurchaseDetail
				icon="globe"
				title={ translate( 'Select your custom domain' ) }
				description={
					translate(
						'Your plan includes a free custom domain. Replace {{em}}%(siteDomain)s{{/em}} ' +
						'with a custom domain to personalize your site. Does not apply to premium domains.',
						{
							args: { siteDomain: selectedSite.domain },
							components: { em: <em /> }
						}
					)
				}
				buttonText={ translate( 'Claim your free domain' ) }
				href={ `/domains/add/${ selectedSite.slug }` }
			/>
		);
	} else if ( ! hasDomainCredit && hasCustomDomain( selectedSite ) ) {
		const actionButton = {};
		actionButton.buttonText = translate( 'Manage my domains' );
		actionButton.href = `/domains/manage/${ selectedSite.slug }`;
		return ( <PurchaseDetail
			icon="globe"
			title={ translate( 'Custom Domain' ) }
			description={ translate(
				'Your plan includes the custom domain {{em}}%(siteDomain)s{{/em}}, your own personal corner of the web.', {
					args: { siteDomain: selectedSite.domain },
					components: { em: <em /> }
				}
			) }
			{ ...actionButton }
		/> );
	} else {
		return null;
	}
};

CustomDomainPurchaseDetail.propTypes = {
	selectedSite: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object
	] ).isRequired,
	hasDomainCredit: PropTypes.bool
};

export default localize( CustomDomainPurchaseDetail );
