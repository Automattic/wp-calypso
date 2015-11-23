/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AccountRecoveryStore from 'lib/security-checkup/account-recovery-store';
import FormSectionHeading from 'components/forms/form-section-heading';


module.exports = React.createClass( {
	displayName: 'SecurityCheckupRecoveryPhone',

	componentDidMount: function() {
		AccountRecoveryStore.on( 'change', this.refreshRecoveryPhone );
	},

	componentWillUnmount: function() {
		AccountRecoveryStore.off( 'change', this.refreshRecoveryEmails );
	},

	getInitialState: function() {
		return {
			recoveryPhone: []
		};
	},

	refreshRecoveryPhone: function() {
		this.setState( { recoveryPhone: AccountRecoveryStore.getEmails() } );
	},

	renderRecoveryPhonePlaceholder: function() {
		return (
			<div>
				<p>Recovery phone</p>
			</div>
		);
	},

	renderRecoveryPhone: function() {
		return (
			<div>
				<FormSectionHeading>Recovery SMS number</FormSectionHeading>
			</div>
		);
	},

	render: function() {
		return (
			<div>
				{ this.renderRecoveryPhone() }
			</div>
		);
	}
} );
