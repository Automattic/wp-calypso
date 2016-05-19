/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import supportUrls from 'lib/url/support';
import PurchaseDetail from 'components/purchase-detail';
import userFactory from 'lib/user';

const user = userFactory();

const GoogleAppsDetails = () => {
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
			href={ supportUrls.GOOGLE_APPS_LEARNING_CENTER }
			target="_blank"
			requiredText={ i18n.translate( 'Almost done! One step remaining…' ) }
			isRequired />
	);
};

export default GoogleAppsDetails;
