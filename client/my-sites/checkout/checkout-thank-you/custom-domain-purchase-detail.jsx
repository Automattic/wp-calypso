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

/**
 * Image dependencies
 */
import customDomainImage from 'assets/images/illustrations/custom-domain.svg';
import customDomainBloggerImage from 'assets/images/illustrations/custom-domain-blogger.svg';

const CustomDomainPurchaseDetail = ( {
	selectedSite,
	hasDomainCredit,
	onlyBlogDomain,
	translate,
} ) => {
	const customDomainIcon = onlyBlogDomain ? customDomainBloggerImage : customDomainImage;
	if ( hasDomainCredit ) {
		return (
			<PurchaseDetail
				icon={ <img alt="" src={ customDomainIcon } /> }
				title={
					onlyBlogDomain
						? translate( 'Select your .blog domain' )
						: translate( 'Select your custom domain' )
				}
				description={
					onlyBlogDomain
						? translate(
								'Your plan includes a free .blog domain for one year, which gives your site a more professional, branded feel.'
						  )
						: translate(
								'Your plan includes a free custom domain for one year, which gives your site a more professional, branded feel.'
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
		return (
			<PurchaseDetail
				icon={ <img alt="" src={ customDomainIcon } /> }
				title={ translate( 'Custom Domain' ) }
				description={ translate(
					'Your plan includes one year of your custom domain {{em}}%(siteDomain)s{{/em}}, your own personal corner of the web.',
					{
						args: { siteDomain: selectedSite.domain },
						components: { em: <em /> },
					}
				) }
				{ ...actionButton }
			/>
		);
	}
	return null;
};

CustomDomainPurchaseDetail.propTypes = {
	onlyBlogDomain: PropTypes.bool,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	hasDomainCredit: PropTypes.bool,
};

export default localize( CustomDomainPurchaseDetail );
