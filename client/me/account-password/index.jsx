/**
 * External dependencies
 */
var React = require( 'react' ),
	LinkedStateMixin = require( 'react-addons-linked-state-mixin' ),
	debug = require( 'debug' )( 'calypso:me:account-password' ),
	_debounce = require( 'lodash/function/debounce' ),
	_first = require( 'lodash/array/first' ),
	_isEmpty = require( 'lodash/lang/isEmpty' ),
	classNames = require( 'classnames' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect;

/**
 * Internal dependencies
 */
var protectForm = require( 'lib/mixins/protect-form' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormPasswordInput = require( 'components/forms/form-password-input' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	observe = require( 'lib/mixins/data-observe' ),
	eventRecorder = require( 'me/event-recorder' ),
	notices = require( 'notices' ),
	errorNotice = require( 'state/notices/actions' ).errorNotice;

const AccountPassword = React.createClass( {

	displayName: 'AccountPassword',

	mixins: [ LinkedStateMixin, protectForm.mixin, observe( 'accountPasswordData' ), eventRecorder ],

	componentDidMount: function() {
		this.debouncedPasswordValidate = _debounce( this.validatePassword, 300 );
	},

	componentWillUnmount: function() {
		this.props.accountPasswordData.clearValidatedPassword();
	},

	getInitialState: function() {
		return {
			pendingValidation: true,
			savingPassword: false
		};
	},

	generateStrongPassword: function() {
		this.setState( {
			password: this.props.accountPasswordData.generate(),
			pendingValidation: true
		} );
		this.debouncedPasswordValidate();
		this.markChanged();
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
		this.setState( { password: newPassword, pendingValidation: true } );

		if ( '' === newPassword ) {
			this.markSaved();
		} else {
			this.markChanged();
		}
	},

	submitForm: function( event ) {
		const { userSettings: { saveSettings }, errorNotice: showErrorNotice } = this.props;
		event.preventDefault();

		this.setState( {
			savingPassword: true
		} );

		saveSettings(
			function( error, response ) {
				this.setState( { savingPassword: false } );
				this.markSaved();

				if ( error ) {
					debug( 'Error saving password: ' + JSON.stringify( error ) );

					// handle error case here
					showErrorNotice( this.translate( 'There was a problem saving your password. Please, try again.' ) );
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
		var failure = _first( this.props.accountPasswordData.getValidationFailures() );

		if ( this.props.accountPasswordData.passwordValidationSuccess() ) {
			return (
				<FormInputValidation text={ this.translate( 'Your password can be saved.' ) } />
			);
		} else if ( ! _isEmpty( failure ) ) {
			return (
				<FormInputValidation isError text={ failure.explanation } />
			);
		}
	},

	render: function() {
		var passwordValueLink = {
				value: this.state.password,
				requestChange: this.handlePasswordChange
			},
			passwordInputClasses = classNames( {
				'account-password__password-field': true,
				'is-error': this.props.accountPasswordData.getValidationFailures().length
			}
		);

		return (
			<form className="account-password" onSubmit={ this.submitForm }>
				<FormFieldset>
					<FormLabel htmlFor="password">{ this.translate( 'New Password' ) }</FormLabel>
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
						{ this.translate(
							"If you can't think of a good password use the button below to generate one."
						) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormButtonsBar className="account-password__buttons-group">
					<FormButton
						disabled={ this.state.pendingValidation || this.props.accountPasswordData.passwordValidationFailed() }
						onClick={ this.recordClickEvent( 'Save Password Button' ) }>
						{ this.state.savingPassword ? this.translate( 'Saving…' ) : this.translate( 'Save Password' ) }
					</FormButton>

					<FormButton
						className="button"
						isPrimary={ false }
						onClick={ this.recordClickEvent( 'Generate Strong Password Button', this.generateStrongPassword ) }
						type="button">
						{ this.translate( 'Generate strong password' ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { errorNotice }, dispatch )
)( AccountPassword );
