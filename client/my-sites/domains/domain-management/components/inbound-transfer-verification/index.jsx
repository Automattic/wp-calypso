/**
 * External dependencies
 *
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmailVerificationCard from 'my-sites/domains/domain-management/components/email-verification';
import { resendInboundTransferEmail } from 'lib/domains';
import { INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS } from 'lib/url/support';
import { Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class InboundTransferEmailVerificationCard extends React.PureComponent {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	render() {
		const { domain, selectedSiteSlug, translate } = this.props;

		const { adminEmail } = domain;

		if ( ! adminEmail ) {
			return (
				<Card highlight="info">
					<div>
						<h1 className="inbound-transfer-verification__heading">
							{ translate( 'The authorization email will be sent shortly.' ) }
						</h1>
						{ translate(
							"We'll let you know which mailbox to check as soon as the email is sent. " +
								'Check again in a few minutes.'
						) }
					</div>
				</Card>
			);
		}

		return (
			<EmailVerificationCard
				contactEmail={ adminEmail }
				errorMessage={ translate( 'Unable to resend domain transfer email.' ) }
				headerText={ translate( 'Important: Confirm the transfer to proceed.' ) }
				verificationExplanation={ translate(
					'We sent an email to confirm the transfer of {{strong}}%(domain)s{{/strong}}. ' +
						'Open the email, click the link, and enter your domain authorization code to start the process. ' +
						'Please confirm in 5 days or the transfer will be canceled. ' +
						'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
					{
						args: {
							domain: domain.name,
						},
						components: {
							learnMoreLink: (
								<a
									href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
							strong: <strong />,
						},
					}
				) }
				resendVerification={ resendInboundTransferEmail }
				selectedDomainName={ domain.name }
				selectedSiteSlug={ selectedSiteSlug }
			/>
		);
	}
}

export default localize( InboundTransferEmailVerificationCard );
