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
					'This usually happens in an instance but if you did change your name, organization or ' +
					'email address you\'ll have to confirm the change via email. ' +
					'You can find more information on contact updates in {{supporta}}our support page{{/supporta}}. ' +
					'If you have any questions or issues please {{a}}contact support{{/a}}.',
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
