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

const GoogleAppsDetails = ( { selectedSite, domain } ) => {
	return (
		<div>
			<PurchaseDetail
				additionalClass="google-apps-details"
				title={ i18n.translate( 'Google Apps Setup' ) }
				description={ i18n.translate( 'You will receive an email shortly with your login information.' ) }
				buttonText={ i18n.translate( 'More about Google Apps' ) }
				href="https://support.wordpress.com/add-email/adding-google-apps-to-your-site/"
				target="_blank" />

			<PurchaseDetail
				additionalClass="important"
				title={ i18n.translate( 'Important!' ) }
				description={ i18n.translate( 'It can take up to 72 hours for your domain setup to complete.' ) }
				buttonText={ i18n.translate( 'Learn More' ) }
				href="//support.wordpress.com/domains/"
				target="_blank" />

			<PurchaseDetail
				additionalClass="your-primary-domain"
				title={ i18n.translate( 'Your Primary Domain' ) }
				description={ i18n.translate( 'Want this to be your primary domain for this site?' ) }
				buttonText={ i18n.translate( 'Update Settings' ) }
				href={ getDomainManagementUrl( selectedSite, domain ) } />
		</div>
	);
};

GoogleAppsDetails.propTypes = {
	selectedSite: React.PropTypes.object.isRequired,
	domain: React.PropTypes.string.isRequired
};

export default GoogleAppsDetails;
