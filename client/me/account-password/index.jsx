/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import { debounce, flowRight as compose, head, isEmpty } from 'lodash';
import React from 'react';
import debugFactory from 'debug';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { ProtectFormGuard } from 'calypso/lib/protect-form';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import { isPendingPasswordChange } from 'calypso/state/user-settings/selectors';
import { generatePassword } from 'calypso/lib/generate-password';
import wp from 'calypso/lib/wp';

/**
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();
const debug = debugFactory( 'calypso:me:account-password' );

/* eslint-disable react/prefer-es6-class */
class AccountPassword extends React.Component {
	state = {
		password: '',
		validation: null,
		pendingValidation: true,
		isUnsaved: false,
	};

	componentDidMount() {
		this.debouncedPasswordValidate = debounce( this.validatePassword, 300 );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.isPendingPasswordChange && ! this.props.isPendingPasswordChange ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { isUnsaved: false } );
		}
	}

	generateStrongPassword = () => {
		this.setState( {
			password: generatePassword(),
			pendingValidation: true,
			isUnsaved: true,
		} );
		this.debouncedPasswordValidate();
	};

	validatePassword = () => {
		const password = this.state.password;
		debug( 'Validating password' );

		if ( '' === password ) {
			this.setState( { validation: null, pendingValidation: false } );
			return;
		}

		wpcom.me().validatePassword( password, ( error, data ) => {
			if ( error ) {
				debug( 'Password is not valid. Please try again.' );
				this.setState( { pendingValidation: false } );
				return;
			}

			debug( JSON.stringify( this.validatedPassword ) );

			this.setState( { pendingValidation: false, validation: { password, ...data } } );
		} );
	};

	handlePasswordChange = ( event ) => {
		const newPassword = event.currentTarget.value;
		debug( 'Handle password change has been called.' );
		this.debouncedPasswordValidate();
		this.setState( {
			password: newPassword,
			pendingValidation: true,
			isUnsaved: '' !== newPassword,
		} );
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
		const failure = head( this.state.validation?.test_results.failed );

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
		const passwordInputClasses = classNames( {
			'account-password__password-field': true,
			'is-error': this.state.validation?.test_results.failed.length,
		} );

		return (
			<form className="account-password" onSubmit={ this.submitForm }>
				<ProtectFormGuard isChanged={ this.state.isUnsaved } />
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
		} ),
		{ errorNotice, recordGoogleEvent, saveUserSettings }
	),
	localize
)( AccountPassword );
