/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import IcannVerification from './icann-verification';
import support from 'lib/url/support';

let IcannVerificationCard = React.createClass( {
	propTypes: {
		handleSubmit: React.PropTypes.func.isRequired,
		submitting: React.PropTypes.bool.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	},

	getExplanation() {
		if ( this.props.explanationContext === 'name-servers' ) {
			return this.translate(
				'You have to verify the email address used to register this domain before you ' +
				'are able to update the name servers for your domain. ' +
				'Look for the verification message in your email inbox.'
			);
		}

		return this.translate(
			'We need to verify the email address you provided for this domain to ensure we can contact ' +
			'you concerning your domain. Please verify your email address or your domain may be suspended. ' +
			'{{learnMoreLink}}Learn more.{{/learnMoreLink}}', {
				components: {
					learnMoreLink: <a href={ support.EMAIL_VALIDATION_AND_VERIFICATION }
						target="_blank"
						rel="noopener noreferrer"
					/>
				}
			}
		);
	},

	render() {
		return (
			<div className="icann-verification is-warning card is-compact">
				<div className="icann-verification__explanation">
					<h1 className="icann-verification__heading">Important: Verify Your Email Address</h1>
					{ this.getExplanation() }
				</div>

				<div className="icann-verification__status-container">
					<div className="icann-verification__status waiting">
						<Gridicon icon="notice-outline" size="36" />
						{ this.translate(
							'Check your email — we\'re waiting for you to verify.'
						)}
					</div>

					<IcannVerification.Button submitting={ this.props.submitting }
					onClick={ this.props.handleSubmit } />

					<div className="icann-verification__sent-to">
						{ this.translate(
							'Sent to registrant@contactemail.com. ' +
							'{{registrantEmail}}Change email address.{{/registrantEmail}}', {
								components: {
									registrantEmail: <a href="#" />
								}
							}
						)}
					</div>
				</div>

			</div>
		);
	}
} );

IcannVerificationCard = IcannVerification.createContainer( IcannVerificationCard );

export default IcannVerificationCard;
