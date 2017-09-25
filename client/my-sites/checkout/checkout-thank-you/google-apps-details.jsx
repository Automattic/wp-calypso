/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import supportUrls from 'lib/url/support';
import userFactory from 'lib/user';

const user = userFactory();

const GoogleAppsDetails = () => {
	return (
		<PurchaseDetail
			icon="cog"
			title={ i18n.translate( 'Finish setting up your G Suite account' ) }
			description={
				i18n.translate(
					'We emailed you at %(email)s with login information for your new G Suite account. If you can’t find it, try a global search for “G Suite”.',
					{ args: { email: user.get().email } }
				)
			}
			buttonText={ i18n.translate( 'Learn more about G Suite' ) }
			href={ supportUrls.GOOGLE_APPS_LEARNING_CENTER }
			target="_blank"
			rel="noopener noreferrer"
			requiredText={ i18n.translate( 'Almost done! One step remaining…' ) }
			isRequired />
	);
};

export default GoogleAppsDetails;
