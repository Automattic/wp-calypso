/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from './purchase-detail';

const SiteRedirectDetails = ( { selectedSite } ) => {
	return (
		<div>
			<PurchaseDetail
				additionalClass="redirect-now-working"
				title={ i18n.translate( 'Redirect now working' ) }
				description={ i18n.translate( 'Visitors to your site will be redirected to your chosen target.' ) }
				buttonText={ i18n.translate( 'Test Redirect' ) }
				href={ selectedSite.URL }
				target="_blank" />

			<PurchaseDetail
				additionalClass="change-redirect-settings"
				title={ i18n.translate( 'Change redirect settings' ) }
				description={ i18n.translate( 'You can disable the redirect or change the target at any time.' ) }
				buttonText={ i18n.translate( 'My Domains' ) }
				href={ getDomainManagementUrl( selectedSite ) } />
		</div>
	);
};

SiteRedirectDetails.propTypes = {
	selectedSite: React.PropTypes.object.isRequired
};

export default SiteRedirectDetails;
