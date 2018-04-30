/** @format */

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
		return (
			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/illustrations/custom-domain.svg" /> }
				title={ translate( 'Select your custom domain' ) }
				description={ translate(
					'Your plan includes a free custom domain, which gives your site a more professional, branded feel.'
				) }
				buttonText={ translate( 'Claim your free domain' ) }
				href={ `/domains/add/${ selectedSite.slug }` }
			/>
		);
	} else if ( ! hasDomainCredit && hasCustomDomain( selectedSite ) ) {
		const actionButton = {};
		actionButton.buttonText = translate( 'Manage my domains' );
		actionButton.href = `/domains/manage/${ selectedSite.slug }`;
		return (
			<PurchaseDetail
				icon={ <img src="/calypso/images/upgrades/custom-domain.svg" /> }
				title={ translate( 'Custom Domain' ) }
				description={ translate(
					'Your plan includes the custom domain {{em}}%(siteDomain)s{{/em}}, your own personal corner of the web.',
					{
						args: { siteDomain: selectedSite.domain },
						components: { em: <em /> },
					}
				) }
				{ ...actionButton }
			/>
		);
	} else {
		return null;
	}
};

CustomDomainPurchaseDetail.propTypes = {
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	hasDomainCredit: PropTypes.bool,
};

export default localize( CustomDomainPurchaseDetail );
