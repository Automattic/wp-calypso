import { FormInputValidation, FormLabel } from '@automattic/components';
import { generatePassword } from '@automattic/generate-password';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { debounce, flowRight as compose, isEmpty } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { protectForm } from 'calypso/lib/protect-form';
import wp from 'calypso/lib/wp';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import {
	hasUserSettingsRequestFailed,
	isPendingPasswordChange,
} from 'calypso/state/user-settings/selectors';

import './style.scss';

class AccountPassword extends Component {
	state = {
		password: '',
		validation: null,
		pendingValidation: true,
	};

	componentDidUpdate( prevProps ) {
		if (
			prevProps.isPendingPasswordChange &&
			! this.props.isPendingPasswordChange &&
			! this.props.hasUserSettingsRequestFailed
		) {
			this.props.markSaved();
			window.location = '?updated=password';
		}
	}

	generateStrongPassword = () => {
		this.setState( {
			password: generatePassword(),
			pendingValidation: true,
		} );
		this.props.markChanged();
		this.validatePassword();
	};

	validatePassword = debounce( async () => {
		const password = this.state.password;

		if ( '' === password ) {
			this.setState( { validation: null, pendingValidation: false } );
			return;
		}

		const validation = await wp.req
			.post( '/me/settings/password/validate', { password } )
			.catch( () => ( {
				passed: false,
				test_results: {
					failed: [
						{
							test_name: 'network_error',
							explanation: this.props.translate(
								'The password could not be validated. Please check your network connection and try again.'
							),
						},
					],
				},
			} ) );

		this.setState( { pendingValidation: false, validation } );
	}, 300 );

	handlePasswordChange = ( event ) => {
		const newPassword = event.currentTarget.value;
		this.validatePassword();

		this.setState( {
			password: newPassword,
			pendingValidation: true,
		} );

		if ( '' !== newPassword ) {
			this.props.markChanged();
		} else {
			this.props.markSaved();
		}
	};

	handleSaveButtonClick = () => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on Save Password Button' );
	};

	handleGenerateButtonClick = () => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on Generate Strong Password Button' );
		this.generateStrongPassword();
	};

	handleNewPasswordFieldFocus = () => {
		this.props.recordGoogleEvent( 'Me', 'Focused on New Password Field' );
	};

	submitForm = ( event ) => {
		event.preventDefault();

		this.props.saveUserSettings( { password: this.state.password } );
	};

	renderValidationNotices = () => {
		const { translate } = this.props;
		const failure = this.state.validation?.test_results.failed?.[ 0 ];

		if ( this.state.validation?.passed ) {
			return (
				<FormInputValidation text={ translate( 'Your password is strong enough to be saved.' ) } />
			);
		} else if ( ! isEmpty( failure ) ) {
			return <FormInputValidation isError text={ failure.explanation } />;
		}
	};

	render() {
		const { translate } = this.props;
		const passwordInputClasses = clsx( {
			'account-password__password-field': true,
			'is-error': this.state.validation?.test_results.failed.length,
		} );

		return (
			<form className="account-password" onSubmit={ this.submitForm }>
				<FormFieldset>
					<FormLabel htmlFor="password">{ translate( 'New password' ) }</FormLabel>
					<FormPasswordInput
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						className={ passwordInputClasses }
						id="password"
						name="password"
						onChange={ this.handlePasswordChange }
						onFocus={ this.handleNewPasswordFieldFocus }
						value={ this.state.password }
						submitting={ this.props.isPendingPasswordChange }
					/>

					{ this.renderValidationNotices() }

					<FormSettingExplanation>
						{ translate(
							"If you can't think of a good password use the button below to generate one."
						) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormButtonsBar className="account-password__buttons-group">
					<FormButton
						disabled={
							this.state.pendingValidation ||
							! this.state.validation?.passed ||
							this.props.isPendingPasswordChange
						}
						onClick={ this.handleSaveButtonClick }
					>
						{ this.props.isPendingPasswordChange
							? translate( 'Saving…' )
							: translate( 'Save password' ) }
					</FormButton>

					<FormButton isPrimary={ false } onClick={ this.handleGenerateButtonClick } type="button">
						{ translate( 'Generate strong password' ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
}

export default compose(
	connect(
		( state ) => ( {
			isPendingPasswordChange: isPendingPasswordChange( state ),
			hasUserSettingsRequestFailed: hasUserSettingsRequestFailed( state ),
		} ),
		{ errorNotice, recordGoogleEvent, saveUserSettings }
	),
	localize,
	protectForm
)( AccountPassword );
