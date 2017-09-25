/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { debounce, flowRight as compose, head, isEmpty } from 'lodash';
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormPasswordInput from 'components/forms/form-password-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import observe from 'lib/mixins/data-observe';
import { ProtectFormGuard } from 'lib/protect-form';
import eventRecorder from 'me/event-recorder';
import { errorNotice } from 'state/notices/actions';

const debug = debugFactory( 'calypso:me:account-password' );

const AccountPassword = React.createClass( {

	displayName: 'AccountPassword',

	mixins: [ LinkedStateMixin, observe( 'accountPasswordData' ), eventRecorder ],

	componentDidMount: function() {
		this.debouncedPasswordValidate = debounce( this.validatePassword, 300 );
	},

	componentWillUnmount: function() {
		this.props.accountPasswordData.clearValidatedPassword();
	},

	getInitialState: function() {
		return {
			pendingValidation: true,
			savingPassword: false,
			isUnsaved: false,
		};
	},

	generateStrongPassword: function() {
		this.setState( {
			password: this.props.accountPasswordData.generate(),
			pendingValidation: true,
			isUnsaved: true,
		} );
		this.debouncedPasswordValidate();
	},

	validatePassword: function() {
		debug( 'Validating password' );
		this.props.accountPasswordData.validate( this.state.password, function() {
			this.setState( { pendingValidation: false } );
		}.bind( this ) );
	},

	handlePasswordChange: function( newPassword ) {
		debug( 'Handle password change has been called.' );
		this.debouncedPasswordValidate();
		this.setState( {
			password: newPassword,
			pendingValidation: true,
			isUnsaved: '' !== newPassword,
		} );
	},

	submitForm: function( event ) {
		const {
			translate,
			errorNotice: showErrorNotice,
		} = this.props;

		event.preventDefault();

		this.setState( {
			savingPassword: true
		} );

		this.props.userSettings.saveSettings(
			function( error, response ) {
				this.setState( {
					savingPassword: false,
					isUnsaved: false,
				} );

				if ( error ) {
					debug( 'Error saving password: ' + JSON.stringify( error ) );

					// handle error case here
					showErrorNotice( translate( 'There was a problem saving your password. Please, try again.' ) );
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

	renderValidationNotices: function() {
		const { translate } = this.props;
		const failure = head( this.props.accountPasswordData.getValidationFailures() );

		if ( this.props.accountPasswordData.passwordValidationSuccess() ) {
			return (
				<FormInputValidation text={ translate( 'Your password can be saved.' ) } />
			);
		} else if ( ! isEmpty( failure ) ) {
			return (
				<FormInputValidation isError text={ failure.explanation } />
			);
		}
	},

	render: function() {
		const { translate } = this.props;
		const passwordValueLink = {
			value: this.state.password,
			requestChange: this.handlePasswordChange,
		};
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
						onFocus={ this.recordFocusEvent( 'New Password Field' ) }
						valueLink={ passwordValueLink }
						submitting={ this.state.savingPassword } />

					{ this.renderValidationNotices() }

					<FormSettingExplanation>
						{ translate(
							"If you can't think of a good password use the button below to generate one."
						) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormButtonsBar className="account-password__buttons-group">
					<FormButton
						disabled={ this.state.pendingValidation || this.props.accountPasswordData.passwordValidationFailed() }
						onClick={ this.recordClickEvent( 'Save Password Button' ) }>
						{ this.state.savingPassword ? translate( 'Saving…' ) : translate( 'Save Password' ) }
					</FormButton>

					<FormButton
						className="button"
						isPrimary={ false }
						onClick={ this.recordClickEvent( 'Generate Strong Password Button', this.generateStrongPassword ) }
						type="button">
						{ translate( 'Generate strong password' ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
} );

export default compose(
	connect(
		null,
		dispatch => bindActionCreators( { errorNotice }, dispatch ),
	),
	localize,
)( AccountPassword );
