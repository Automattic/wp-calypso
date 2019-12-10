/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { resendIcannVerification } from 'lib/domains';
import notices from 'notices';
import { TRANSFER_DOMAIN_REGISTRATION } from 'lib/url/support';

class IcannVerification extends React.Component {
	state = {
		submitting: false,
	};

	handleClick = () => {
		this.setState( { submitting: true } );

		resendIcannVerification( this.props.selectedDomainName, error => {
			if ( error ) {
				notices.error( error.message );
			} else {
				notices.success(
					this.props.translate(
						'We sent the ICANN verification email to your ' +
							'email address. Please check your inbox and click the link in the email.'
					)
				);
			}

			this.setState( { submitting: false } );
		} );
	};

	render() {
		const { translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Transfer Domain' ) }>
					<Button onClick={ this.handleClick } disabled={ this.state.submitting } compact primary>
						{ translate( 'Resend Verification Email' ) }
					</Button>
				</SectionHeader>

				<Card className="transfer-out__card">
					{ translate(
						'You must verify your email address before you can transfer this domain. ' +
							'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
						{
							components: {
								learnMoreLink: (
									<a
										href={ TRANSFER_DOMAIN_REGISTRATION }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</Card>
			</div>
		);
	}
}

export default localize( IcannVerification );
