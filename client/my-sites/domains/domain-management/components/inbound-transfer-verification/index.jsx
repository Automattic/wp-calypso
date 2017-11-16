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

class InboundTransferEmailVerificationCard extends React.Component {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	render() {
		return (
			<div>
				<EmailVerificationCard
					verificationExplanation={ this.props.translate(
						'We need to check your contact information to make sure you can be reached. Please verify your ' +
							'details using the email we sent you to begin transferring the domain to WordPress.com. ' +
							'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
						{
							components: {
								learnMoreLink: (
									<a
										href="http://support.wordpress.com"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
					resendVerification={ resendInboundTransferEmail }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSiteSlug={ this.props.selectedSiteSlug }
				/>
			</div>
		);
	}
}

export default localize( InboundTransferEmailVerificationCard );
