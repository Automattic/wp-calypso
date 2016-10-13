/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import { hasCustomDomain } from 'lib/site/utils';

const CustomDomainPurchaseDetail = ( { selectedSite, hasDomainCredit, translate } ) => {
	const renderClaimCustomDomain = () =>
		<PurchaseDetail
			icon="globe"
			title={ translate( 'Select Your Custom Domain' ) }
			description={
				translate(
					'Your plan includes a free custom domain. Replace {{em}}%(siteDomain)s{{/em}} ' +
					'with a custom domain to personalize your site.',
					{
						args: { siteDomain: selectedSite.domain },
						components: { em: <em /> }
					}
				)
			}
			buttonText={ translate( 'Claim your free domain' ) }
			href={ `/domains/add/${ selectedSite.slug }` }
		/>;

	const renderHasCustomDomain = () =>
		<PurchaseDetail
			icon="globe"
			title={ translate( 'Custom Domain' ) }
			description={ translate(
				'Your plan includes the custom domain {{em}}%(siteDomain)s{{/em}}, your own personal corner of the web.', {
					args: { siteDomain: selectedSite.domain },
					components: { em: <em /> }
				}
			) }
			buttonText={ translate( 'Manage my domains' ) }
			href={ `/domains/manage/${ selectedSite.slug }` }
		/>;

	const renderCustomDomainDetail = () => {
		if ( hasCustomDomain( selectedSite ) ) {
			return renderHasCustomDomain();
		}

		return null;
	};

	return (
		hasDomainCredit
			? renderClaimCustomDomain()
			: renderCustomDomainDetail()
	);
};

CustomDomainPurchaseDetail.propTypes = {
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired,
	hasDomainCredit: React.PropTypes.bool
};

export default localize( CustomDomainPurchaseDetail );
