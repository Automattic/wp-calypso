/**
 * External dependencies
 */
import React from 'react';
import assign from 'lodash/object/assign';

/**
 * Internal dependencies
 */
import AccountRecoveryStore from 'lib/security-checkup/account-recovery-store';
import ActionRemove from 'me/action-remove';

module.exports = React.createClass( {
	displayName: 'SecurityCheckupRecoveryEmails',

	componentDidMount: function() {
		AccountRecoveryStore.on( 'change', this.refreshRecoveryEmails );
	},

	componentWillUnmount: function() {
		AccountRecoveryStore.off( 'change', this.refreshRecoveryEmails );
	},

	getInitialState: function() {
		return {
			recoveryEmails: []
		};
	},

	refreshRecoveryEmails: function() {
		this.setState( { recoveryEmails: AccountRecoveryStore.getEmails() } );
	},

	renderRecoveryEmailsPlaceholder: function() {
		return (
			<div>
				<p>Recovery emails</p>
				<ul>
					<li>Dummy recovery email</li>
				</ul>
			</div>
		);
	},

	renderRecoveryEmail: function( recoveryEmail ) {
		return (
			<li>
				{ recoveryEmail }
				<ActionRemove />
			</li>
		);
	},

	renderRecoveryEmails: function() {
		return (
			<div>
				<p>Recovery emails</p>
				<ul>
					{ this.state.recoveryEmails.data.emails.map( recoveryEmail => this.renderRecoveryEmail( recoveryEmail ) ) }
				</ul>
			</div>
		);
	},

	render: function() {
		return (
			<div>
				{ this.renderRecoveryEmails() }
			</div>
		);
	}
} );
