/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import IcannVerification from 'my-sites/upgrades/domain-management/components/icann-verification';
import { getSelectedDomain } from 'lib/domains';
import SimpleNotice from 'notices/simple-notice';

let IcannVerificationNotice = React.createClass( {
	propTypes: {
		handleSubmit: React.PropTypes.func.isRequired,
		submitting: React.PropTypes.bool.isRequired,
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	},

	render() {
		const { isPendingIcannVerification } = getSelectedDomain( this.props );

		if ( ! isPendingIcannVerification ) {
			return null;
		}

		return (
			<SimpleNotice className="icann-verification"
					showDismiss={ false }
					status={ null }>
				<p>
					{ this.translate(
						'You must verify your email address through the ICANN ' +
						'verification email before you can transfer this domain.'
					) }
				</p>

				<IcannVerification.Button submitting={ this.props.submitting }
					onClick={ this.props.handleSubmit } />
			</SimpleNotice>
		);
	}
} );

IcannVerificationNotice = IcannVerification.createContainer( IcannVerificationNotice );

export default IcannVerificationNotice;
