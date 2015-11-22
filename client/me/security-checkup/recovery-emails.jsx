/**
 * External dependencies
 */
import React from 'react';
import assign from 'lodash/object/assign';

/**
 * Internal dependencies
 */
import AccountRecoveryAction from 'lib/security-checkup/actions';
import AccountRecoveryStore from 'lib/security-checkup/account-recovery-store';
import FormFieldSet from 'components/forms/form-buttons-bar';
import FormTextInput from 'components/forms/form-buttons-bar';
import FormSettingExplanation from 'components/forms/form-buttons-bar';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormButton from 'components/forms/form-button';
import ActionRemove from 'me/action-remove';
import isEmpty from 'lodash/lang/isEmpty';

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
			recoveryEmails: [],
			isAddingRecoveryEmail: false
		};
	},

	addEmail: function() {
		this.setState( { isAddingRecoveryEmail: true } );
	},

	saveEmail: function() {
		this.setState( { isAddingRecoveryEmail: false } );
	},

	cancelEmail: function() {
		this.setState( { isAddingRecoveryEmail: false } );
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
		if ( isEmpty( this.state.recoveryEmails ) ) {
			return(
				<div>
					<p>You don't have any recovery emails</p>
				</div>
			);
		}

		return (
			<div>
				<p>Recovery emails</p>
				<ul>
					{ this.state.recoveryEmails.data.emails.map( recoveryEmail => this.renderRecoveryEmail( recoveryEmail ) ) }
				</ul>

			</div>
		);
	},

	renderRecoveryEmailActions: function() {
		if ( this.state.isAddingRecoveryEmail ) {
			return(
				<div>
					<FormButtonsBar>
						<FormButton onClick={ this.cancelEmail }  isPrimary={ false } >
							{ this.translate( 'Cancel' ) }
						</FormButton>
						<FormButton onClick={ this.saveEmail } isPrimary={ false } >
							{ this.translate( 'Save Email' ) }
						</FormButton>
					</FormButtonsBar>
				</div>
			);
		}

		return(
			<FormButton onClick={ this.addEmail } isPrimary={ false } >
				{ this.translate( 'Add Email' ) }
			</FormButton>
		);
	},

	render: function() {
		return (
			<div>
				{ this.renderRecoveryEmails() }
				{ this.renderRecoveryEmailActions() }
			</div>
		);
	}
} );
