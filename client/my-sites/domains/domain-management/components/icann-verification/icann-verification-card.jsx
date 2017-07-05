/**
 * External dependencies
 */
import React from 'react';

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
			'You have to verify the email address used to register this domain before you can make changes. ' +
			'Look for the verification message in your email inbox. ' +
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
			<div className="icann-verification is-warning card">
				<div className="icann-verification__explanation">
					{ this.getExplanation() }
				</div>

				<IcannVerification.Button submitting={ this.props.submitting }
					onClick={ this.props.handleSubmit } />

				<div className="icann-verification__email">
					{ this.translate(
						'Verification email sent to: [registrant contact email]. ' +
						'{{registrantEmail}}Change email address.{{/registrantEmail}}', {
							components: {
								registrantEmail: <a href="#" />
							}
						}
					)}
				</div>

			</div>
		);
	}
} );

IcannVerificationCard = IcannVerification.createContainer( IcannVerificationCard );

export default IcannVerificationCard;
