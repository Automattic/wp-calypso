/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { GOOGLE_APPS_LEARNING_CENTER } from 'lib/url/support';
import PurchaseDetail from 'components/purchase-detail';
import userFactory from 'lib/user';

const user = userFactory();

const GoogleAppsDetails = () => {
	return (
		<PurchaseDetail
			icon="mail"
			title={ i18n.translate( 'Check your email to finish setting up your G Suite account' ) }
			description={ i18n.translate(
				'We emailed you at {{strong}}%(email)s{{/strong}} with login information ' +
					'so you can start using new professional email addresses and other G Suite apps. ' +
					'If you can’t find it, try searching “G Suite” in your email inbox. {{link}}Learn more about G Suite{{/link}}',
				{
					components: {
						strong: <strong />,
						link: (
							<a
								className="checkout-thank-you__gsuite-support-link"
								href={ GOOGLE_APPS_LEARNING_CENTER }
								rel="noopener noreferrer"
								target="_blank"
							/>
						),
					},
					args: {
						email: user.get().email,
					},
				}
			) }
			requiredText={ i18n.translate( 'Almost done! One step remaining…' ) }
			isRequired
		/>
	);
};

export default GoogleAppsDetails;
