/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import { debounce, flowRight as compose, head, isEmpty } from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:account-password' );
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { ProtectFormGuard } from 'lib/protect-form';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormPasswordInput from 'components/forms/form-password-input';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormInputValidation from 'components/forms/form-input-validation';
/* eslint-disable no-restricted-imports */
import observe from 'lib/mixins/data-observe';
import { errorNotice } from 'state/notices/actions';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

/* eslint-disable react/prefer-es6-class */
const AccountPassword = createReactClass( {
	displayName: 'AccountPassword',

	mixins: [ observe( 'accountPasswordData' ) ],

	componentDidMount: function () {
		this.debouncedPasswordValidate = debounce( this.validatePassword, 300 );
	},

	componentWillUnmount: function () {
		this.props.accountPasswordData.clearValidatedPassword();
	},

	getInitialState: function () {
		return {
			password: '',
			pendingValidation: true,
			savingPassword: false,
			isUnsaved: false,
		};
	},

	generateStrongPassword: function () {
		this.setState( {
			password: this.props.accountPasswordData.generate(),
			pendingValidation: true,
			isUnsaved: true,
		} );
		this.debouncedPasswordValidate();
	},

	validatePassword: function () {
		debug( 'Validating password' );
		this.props.accountPasswordData.validate(
			this.state.password,
			function () {
				this.setState( { pendingValidation: false } );
			}.bind( this )
		);
	},

	handlePasswordChange: function ( event ) {
		const newPassword = event.currentTarget.value;
		debug( 'Handle password change has been called.' );
		this.debouncedPasswordValidate();
		this.setState( {
			password: newPassword,
			pendingValidation: true,
			isUnsaved: '' !== newPassword,
		} );
	},

	handleSaveButtonClick() {
		this.props.recordGoogleEvent( 'Me', 'Clicked on Save Password Button' );
	},

	handleGenerateButtonClick() {
		this.props.recordGoogleEvent( 'Me', 'Clicked on Generate Strong Password Button' );
		this.generateStrongPassword();
	},

	handleNewPasswordFieldFocus() {
		this.props.recordGoogleEvent( 'Me', 'Focused on New Password Field' );
	},

	submitForm: function ( event ) {
		const { translate, errorNotice: showErrorNotice } = this.props;

		event.preventDefault();

		this.setState( {
			savingPassword: true,
		} );

		this.props.userSettings.saveSettings(
			function ( error, response ) {
				this.setState( {
					savingPassword: false,
					isUnsaved: false,
				} );

				if ( error ) {
					debug( 'Error saving password: ' + JSON.stringify( error ) );

					// handle error case here
					showErrorNotice(
						translate( 'There was a problem saving your password. Please, try again.' )
					);
					this.setState( { submittingForm: false } );
				} else {
					debug( 'Password saved successfully' + JSON.stringify( response ) );

					// Since changing a user's password invalidates the session, we reload.
					window.location = window.location.pathname + '?updated=password';
				}
			}.bind( this ),
			{ password: this.state.password }
		);
	},

	renderValidationNotices: function () {
		const { translate } = this.props;
		const failure = head( this.props.accountPasswordData.getValidationFailures() );

		if ( this.props.accountPasswordData.passwordValidationSuccess() ) {
			return (
				<FormInputValidation text={ translate( 'Your password is strong enough to be saved.' ) } />
			);
		} else if ( ! isEmpty( failure ) ) {
			return <FormInputValidation isError text={ failure.explanation } />;
		}
	},

	render: function () {
		const { translate } = this.props;
		const passwordInputClasses = classNames( {
			'account-password__password-field': true,
			'is-error': this.props.accountPasswordData.getValidationFailures().length,
		} );

		return (
			<form className="account-password" onSubmit={ this.submitForm }>
				<ProtectFormGuard isChanged={ this.state.isUnsaved } />
				<FormFieldset>
					<FormLabel htmlFor="password">{ translate( 'New Password' ) }</FormLabel>
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
						submitting={ this.state.savingPassword }
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
							this.props.accountPasswordData.passwordValidationFailed()
						}
						onClick={ this.handleSaveButtonClick }
					>
						{ this.state.savingPassword ? translate( 'Saving…' ) : translate( 'Save password' ) }
					</FormButton>

					<FormButton isPrimary={ false } onClick={ this.handleGenerateButtonClick } type="button">
						{ translate( 'Generate strong password' ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	},
} );

export default compose(
	connect( null, { errorNotice, recordGoogleEvent } ),
	localize
)( AccountPassword );
