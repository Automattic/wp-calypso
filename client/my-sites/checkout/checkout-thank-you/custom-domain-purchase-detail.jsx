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

const CustomDomainPurchaseDetail = ( {
	isButtonPrimary = true,
	selectedSite,
	hasDomainCredit,
	translate,
} ) => {
	if ( hasDomainCredit && selectedSite.plan.user_is_owner ) {
		return (
			<PurchaseDetail
				icon={ <img src="/calypso/images/upgrades/custom-domain.svg" /> }
				title={ translate( 'Select your custom domain' ) }
				description={ translate(
					'Your plan includes a free custom domain, which gives your site a more professional, branded feel.'
				) }
				buttonText={ translate( 'Claim your free domain' ) }
				href={ `/domains/add/${ selectedSite.slug }` }
				primary={ isButtonPrimary }
			/>
		);
	} else if ( ! hasDomainCredit && hasCustomDomain( selectedSite ) ) {
		const actionButton = {};
		actionButton.buttonText = translate( 'Manage my domains' );
		actionButton.href = `/domains/manage/${ selectedSite.slug }`;
		return (
			<PurchaseDetail
				icon={ <img src="/calypso/images/upgrades/custom-domain.svg" alt="" /> }
				title={ translate( 'Custom Domain' ) }
				description={ translate(
					'Your plan includes the custom domain {{em}}%(siteDomain)s{{/em}}, your own personal corner of the web.',
					{
						args: { siteDomain: selectedSite.domain },
						components: { em: <em /> },
					}
				) }
				primary={ isButtonPrimary }
				{ ...actionButton }
			/>
		);
	}
	return null;
};

CustomDomainPurchaseDetail.propTypes = {
	hasDomainCredit: PropTypes.bool,
	isButtonPrimary: PropTypes.bool,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
};

export default localize( CustomDomainPurchaseDetail );
