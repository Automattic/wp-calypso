/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { resendIcannVerification } from 'lib/upgrades/actions/domain-management';
import Button from 'components/button';
import notices from 'notices';
import support from 'lib/url/support';

const IcannVerification = React.createClass( {
	getInitialState() {
		return {
			submitting: false
		};
	},

	handleClick() {
		this.setState( { submitting: true } );

		resendIcannVerification( this.props.selectedDomainName, ( error ) => {
			if ( error ) {
				notices.error( error.message );
			} else {
				notices.success( this.translate(
					'We sent the ICANN verification email to your ' +
					'email address. Please check your inbox and click the link in the email.'
				) );
			}

			this.setState( { submitting: false } );
		} );
	},

	render() {
		return (
			<div>
				<SectionHeader label={ this.translate( 'Transfer Domain' ) }>
					<Button
						onClick={ this.handleClick }
						disabled={ this.state.submitting }
						compact
						primary>{ this.translate( 'Resend Verification Email' ) }</Button>
				</SectionHeader>

				<Card className="transfer-card">
					<p>
						{ this.translate(
							'You must verify your email address before you can transfer this domain. ' +
							'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
							{
								components: {
									learnMoreLink: <a
										href={ support.TRANSFER_DOMAIN_REGISTRATION }
										target="_blank"
										rel="noopener noreferrer"/>
								}
							}
						) }
					</p>
				</Card>
			</div>
		);
	}
} );
export default IcannVerification;
