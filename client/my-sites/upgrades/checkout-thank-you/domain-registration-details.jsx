/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import { isPlan } from 'lib/products-values';
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from './purchase-detail';

const DomainRegistrationDetails = ( { selectedSite, domain } ) => {
	return (
		<div>
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

			{ ! isPlan( selectedSite.plan ) ? <PurchaseDetail
				additionalClass="upgrade-now"
				title={ i18n.translate( 'Upgrade Now' ) }
				description={ i18n.translate( 'Take your blog to the next level by upgrading to one of our plans.' ) }
				buttonText={ i18n.translate( 'View Plans' ) }
				href={ '/plans/' + selectedSite.slug } /> : null }
		</div>
	);
};

DomainRegistrationDetails.propTypes = {
	selectedSite: React.PropTypes.object.isRequired,
	domain: React.PropTypes.string.isRequired
};

export default DomainRegistrationDetails;

