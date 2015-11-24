/**
 * External dependencies
 */
import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';

/**
 * Internal dependencies
 */
import AccountRecoveryStore from 'lib/security-checkup/account-recovery-store';
import SecurityCheckupActions from 'lib/security-checkup/actions';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormPhoneInput from 'components/forms/form-phone-input';
import FormTextInput from 'components/forms/form-text-input';
import countriesList from 'lib/countries-list';

module.exports = React.createClass( {
	displayName: 'SecurityCheckupRecoveryPhone',

	mixins: [ React.addons.LinkedStateMixin ],

	componentDidMount: function() {
		AccountRecoveryStore.on( 'change', this.refreshRecoveryPhone );
	},

	componentWillUnmount: function() {
		AccountRecoveryStore.off( 'change', this.refreshRecoveryPhone );
	},

	getInitialState: function() {
		return {
			recoveryPhone: AccountRecoveryStore.getPhone(),
			recoveryPhoneScreen: 'recoveryPhone',
			verfificationCode: '',
			isSavingRecoveryPhone: false,
			isVerifyingCode: false,
			isSendingCode: false
		};
	},

	refreshRecoveryPhone: function() {
		this.setState( {
			recoveryPhone: AccountRecoveryStore.getPhone(),
			isSavingRecoveryPhone: AccountRecoveryStore.isSavingRecoveryPhone()
		} );
	},

	edit: function() {
		this.setState( { recoveryPhoneScreen: 'editRecoveryPhone' } );
	},

	sendCode: function() {
		this.setState( { recoveryPhoneScreen: 'verfiyRecoveryPhone' } );
	},

	verifyCode: function() {
		this.setState( { recoveryPhoneScreen: 'saveRecoveryPhone' } );
	},

	savePhone: function() {
		this.setState( { recoveryPhoneScreen: 'recoveryPhone' } );
	},

	cancel: function() {
		this.setState( { recoveryPhoneScreen: 'recoveryPhone' } );
	},

	recoveryPhonePlaceHolder: function() {
		return(
			<div>
				<FormSectionHeading>Recovery phone placeholder</FormSectionHeading>
				<p>Recovery phone placeholder</p>
				<FormButton onClick={ this.edit } isPrimary={ false } >
					{ this.translate( 'Edit Phone' ) }
				</FormButton>
			</div>
		);
	},

	getRecoveryPhone: function() {
		if ( isEmpty( this.state.recoveryPhone.data ) ) {
			return(
				<p>No recovery phone</p>
			);
		}

		return (
			<p>0775143910</p>
		);
	},

	recoveryPhone: function() {
		return (
			<div>
				<FormSectionHeading>Recovery phone</FormSectionHeading>
				{ this.getRecoveryPhone() }
				<FormButton onClick={ this.edit } isPrimary={ false } >
					{ this.translate( 'Edit Phone' ) }
				</FormButton>
			</div>
		);
	},

	editRecoveryPhone: function() {
		return(
			<div>
				<FormPhoneInput
					countriesList={ countriesList.forSms() }
					/>
				<FormButtonsBar>
					<FormButton onClick={ this.sendCode } >
						{ this.state.isSendingCode ? this.translate( 'Sending code' ) : this.translate( 'Send code' ) }
					</FormButton>
					<FormButton onClick={ this.cancelPhone }  isPrimary={ false } >
						{ this.translate( 'Cancel' ) }
					</FormButton>
				</FormButtonsBar>
			</div>
		);
	},

	verfiyRecoveryPhone: function() {
		return(
			<div>
				<FormTextInput valueLink={ this.linkState( 'verificationCode' ) } ></FormTextInput>
				<FormButtonsBar>
					<FormButton onClick={ this.verifyCode } >
						{ this.state.isVerifyingCode ? this.translate( 'verifying' ) : this.translate( 'Verify code' ) }
					</FormButton>
					<FormButton onClick={ this.cancel }  isPrimary={ false } >
						{ this.translate( 'Cancel' ) }
					</FormButton>
				</FormButtonsBar>
			</div>
		);
	},

	saveRecoveryPhone: function() {
		return(
			<div>
				<FormButtonsBar>
					<FormButton onClick={ this.savePhone } >
						{ this.state.isSendingCode ? this.translate( 'verifying' ) : this.translate( 'Verify code' ) }
					</FormButton>
					<FormButton onClick={ this.cancel }  isPrimary={ false } >
						{ this.translate( 'Cancel' ) }
					</FormButton>
				</FormButtonsBar>
			</div>
		);
	},

	getRecoveryPhoneScreen: function() {
		if ( this.state.recoveryPhone.loading ) {
			return this.recoveryPhonePlaceHolder();
		}

		switch ( this.state.recoveryPhoneScreen ) {
			case 'recoveryPhone':
				return this.recoveryPhone();
			case 'editRecoveryPhone':
				return this.editRecoveryPhone();
			case 'verfiyRecoveryPhone':
				return this.verfiyRecoveryPhone();
			case 'saveRecoveryPhone':
				return this.saveRecoveryPhone();
			default:
				return this.recoveryPhone();
		}
	},

	render: function() {
		return (
			<div>
				{ this.getRecoveryPhoneScreen() }
			</div>
		);
	}
} );
