/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Notice from 'components/notice';
import support from 'lib/url/support';

function PendingWhoisUpdateCard( { translate } ) {
	return (
		<div className="edit-contact-info__pending-whois-update-card">
			<Notice
				status="is-warning"
				showDismiss={ false }>
				{ translate( 'Domain is pending contact information update' ) }
			</Notice>
			<Card>
				{ translate(
					'Your change will be reflected shortly. Please note that if you made a change to your name, ' +
					'organization, or email address, you must confirm the change by clicking the confirmation ' +
					'link(s) in the email(s) sent to you. If you have any questions or issues, please refer to our ' +
					'{{supporta}}support page{{/supporta}} or {{a}}contact support{{/a}}.',
					{
						components: {
							a: <a href={ support.CALYPSO_CONTACT } rel="noopener noreferrer" />,
							supporta: <a
								href="https://en.support.wordpress.com/update-contact-information/#email-or-name-changes"
								target="_blank"
								rel="noopener noreferrer" />
						}
					}
				) }
			</Card>
		</div>
	);
}

export default localize( PendingWhoisUpdateCard );
