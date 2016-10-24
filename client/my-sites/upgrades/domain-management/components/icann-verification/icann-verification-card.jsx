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
					'You must verify your email address through the ICANN ' +
					'verification email before you are able to update the name ' +
					'servers for your domain.' );
		}

		return this.translate(
			'Urgent. Please verify your address through the verification email as soon as possible, or your domain may be suspended.'
		);
	},

	render() {
		return (
			<div className="icann-verification is-compact card">
				<div className="icann-verification__explanation">
					{ this.getExplanation() }
				</div>

				<IcannVerification.Button submitting={ this.props.submitting }
					onClick={ this.props.handleSubmit } />

				<div className="icann-verification__explanation">
					{ this.translate(
						'Use this button to resend the verification email. It contains a link to verify your address. ' +
						'{{learnMoreLink}}Learn more{{/learnMoreLink}}.', {
							components: {
								learnMoreLink: <a href={ support.EMAIL_VALIDATION_AND_VERIFICATION }
									target="_blank"
									rel="noopener noreferrer"
								/>
							}
						}
					) }
				</div>
			</div>
		);
	}
} );

IcannVerificationCard = IcannVerification.createContainer( IcannVerificationCard );

export default IcannVerificationCard;
