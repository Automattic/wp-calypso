/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import IcannVerification from 'my-sites/upgrades/domain-management/components/icann-verification';

let IcannVerificationCard = React.createClass( {
	propTypes: {
		handleSubmit: React.PropTypes.func.isRequired,
		submitting: React.PropTypes.bool.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	},

	render() {
		return (
			<div className="icann-verification is-compact card">
				<div className="icann-verification__explanation">
					{ this.translate(
						'You must verify your email address through the ICANN ' +
						'verification email before you are able to update the name ' +
						'servers for your domain.'
					) }
				</div>

				<IcannVerification.Button submitting={ this.props.submitting }
					onClick={ this.props.handleSubmit } />

				<div className="icann-verification__explanation">
					{ this.translate(
						'You might be seeing this message, because the email in your ' +
						'Contact Information is wrong.'
					) }
				</div>
			</div>
		);
	}
} );

IcannVerificationCard = IcannVerification.createContainer( IcannVerificationCard );

export default IcannVerificationCard;
