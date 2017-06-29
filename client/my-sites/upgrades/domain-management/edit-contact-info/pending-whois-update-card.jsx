/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Notice from 'components/notice';
import support from 'lib/url/support';

function PendingWhoisUpdateCard( { translate } ) {
	return (
		<Card className="edit-contact-info__pending-whois-update-card">
			<Notice
				status="is-warning"
				showDismiss={ false }
				isCompact={ false } >
				<h2>{ translate( 'Domain is pending contact information update' ) }</h2>
			</Notice>
			<p>
				{ translate(
					'Your change will be reflected shortly. Please note that if you made a change to your name, ' +
					'organization, or email address, you must confirm the change by clicking the confirmation ' +
					'link(s) in the email(s) sent to you. If you have any questions or issues, please refer to our ' +
					'{{supporta}}support page{{/supporta}} or {{a}}contact support{{/a}}.',
					{
						components: {
							a: <a href={ support.CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />,
							supporta: <a
								href="https://en.support.wordpress.com/update-contact-information/#email-or-name-changes"
								target="_blank"
								rel="noopener noreferrer" />
						}
					}
				) }
			</p>
		</Card>
	);
}

export default localize( PendingWhoisUpdateCard );
