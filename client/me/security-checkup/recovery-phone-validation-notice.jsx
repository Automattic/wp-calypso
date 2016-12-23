/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTelInput from 'components/forms/form-tel-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormButton from 'components/forms/form-button';

class RecoveryPhoneValidationNotice extends Component {
	constructor() {
		super();

		this.state = {
			candidateCode: '',
		};
	}

	onSubmit( event ) {
		event.preventDefault();
	}

	onResend = ( event ) => {
		event.preventDefault();

		this.props.onResend();
	}

	onValidate = ( event ) => {
		event.preventDefault();

		this.props.onValidate( this.state.candidateCode );
	}

	onChange = ( event ) => {
		event.preventDefault();

		this.setState( {
			candidateCode: event.target.value,
		} );
	}

	render() {
		const {
			translate,
		} = this.props;

		return (
			<form onSubmit={ this.onSubmit }>
				<FormTelInput
					autoComplete="off"
					disabled={ false }
					placeholder={ translate( 'e.g. 12345678' ) }
					onChange={ this.onChange }
					value={ this.state.candidateCode }
				/>
				<FormSettingExplanation>
					{ translate( 'A code has been sent to your device via SMS. ' +
						'Please check you phone.' ) }
				</FormSettingExplanation>
				<FormButtonsBar>
					<FormButton
						isPrimary={ true }
						onClick={ this.onValidate }
					>
						{ translate( 'Validate' ) }
					</FormButton>
					<FormButton
						isPrimary={ false }
						onClick={ this.onResend }
					>
						{ translate( 'Resend' ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
}

export default localize( RecoveryPhoneValidationNotice );
