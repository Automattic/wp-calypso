/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import PurchaseDetail from 'calypso/components/purchase-detail';

const SiteRedirectDetails = ( { selectedSite, domain } ) => {
	return (
		<div>
			<PurchaseDetail
				icon="external"
				title={ i18n.translate( 'Test the redirect' ) }
				description={ i18n.translate(
					'Visitors to your site will be automatically redirected to {{em}}%(url)s{{/em}}.',
					{
						args: { url: domain },
						components: { em: <em /> },
					}
				) }
				buttonText={ i18n.translate( 'Try it now' ) }
				href={ `${ selectedSite.options.unmapped_url }` }
				target="_blank"
				rel="noopener noreferrer"
			/>

			<PurchaseDetail
				icon="cog"
				title={ i18n.translate( 'Change redirect settings' ) }
				description={ i18n.translate(
					'Disable the redirect by choosing a different primary domain, or change the target address.'
				) }
				buttonText={ i18n.translate( 'Manage redirect' ) }
				href={ getDomainManagementUrl( selectedSite, domain ) }
			/>
		</div>
	);
};

SiteRedirectDetails.propTypes = {
	domain: PropTypes.string.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
};

export default SiteRedirectDetails;
