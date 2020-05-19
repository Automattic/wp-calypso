/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import { resendIcannVerification } from 'lib/domains';
import notices from 'notices';
import { TRANSFER_DOMAIN_REGISTRATION } from 'lib/url/support';

class IcannVerification extends React.Component {
	state = {
		submitting: false,
	};

	handleClick = () => {
		this.setState( { submitting: true } );

		resendIcannVerification( this.props.selectedDomainName, ( error ) => {
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
				<Card className="transfer-out__card">
					<p>
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
					</p>
					<Button
						className="transfer-out__action-button"
						onClick={ this.handleClick }
						disabled={ this.state.submitting }
						primary
					>
						{ translate( 'Resend Verification Email' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( IcannVerification );
