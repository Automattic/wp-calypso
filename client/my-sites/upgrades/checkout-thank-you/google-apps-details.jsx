/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from 'components/purchase-detail';
import userFactory from 'lib/user';

const user = userFactory();

const GoogleAppsDetails = ( { selectedSite } ) => {
	return (
		<PurchaseDetail
			icon="cog"
			title={ i18n.translate( 'Finish setting up your Google Apps account' ) }
			description={
				i18n.translate(
					'We emailed you at %(email)s with login information for your new Google Apps account. If you can’t find it, try a global search for “Google Apps”.',
					{ args: { email: user.get().email } }
				)
			}
			buttonText={ i18n.translate( 'Learn more about Google Apps' ) }
			href="https://apps.google.com/learning-center/"
			target="_blank" />
	);
};

GoogleAppsDetails.propTypes = {
	selectedSite: React.PropTypes.object.isRequired
};

export default GoogleAppsDetails;
