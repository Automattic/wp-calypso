/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import PurchaseDetail from 'components/purchase-detail';

const SiteRedirectDetails = ( { selectedSite, domain } ) => {
	return (
		<div>
			<PurchaseDetail
				icon="external"
				title={ i18n.translate( 'Test the redirect' ) }
				description={
					i18n.translate(
						'Visitors to your site will be automatically redirected to {{em}}%(url)s{{/em}}.',
						{
							args: { url: domain },
							components: { em: <em /> }
						}
					)
				}
				buttonText={ i18n.translate( 'Try it now' ) }
				href={ `${ selectedSite.options.unmapped_url }` }
				target="_blank" />

			<PurchaseDetail
				icon="cog"
				title={ i18n.translate( 'Change redirect settings' ) }
				description={ i18n.translate( 'Disable the redirect by choosing a different primary domain, or change the target address.' ) }
				buttonText={ i18n.translate( 'Manage redirect' ) }
				href={ getDomainManagementUrl( selectedSite, domain ) } />
		</div>
	);
};

SiteRedirectDetails.propTypes = {
	domain: React.PropTypes.string.isRequired,
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired
};

export default SiteRedirectDetails;
