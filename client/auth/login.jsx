/** @format */
/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import config from 'config';
import Main from 'components/main';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import Notice from 'components/notice';
import AuthStore from 'lib/oauth-store';
import * as AuthActions from 'lib/oauth-store/actions';
import WordPressLogo from 'components/wordpress-logo';
import AuthCodeButton from './auth-code-button';
import SelfHostedInstructions from './self-hosted-instructions';
import LostPassword from './lost-password';
import { recordGoogleEvent } from 'state/analytics/actions';

export const Login = createReactClass( {
	displayName: 'Auth',

	componentDidMount: function() {
		AuthStore.on( 'change', this.refreshData );
	},

	componentWillUnmount: function() {
		AuthStore.off( 'change', this.refreshData );
	},

	getClickHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	},

	getFocusHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	},

	refreshData: function() {
		this.setState( AuthStore.get() );
	},

	focusInput( input ) {
		if ( this.state.requires2fa && this.state.inProgress === false ) {
			input.focus();
		}
	},

	getInitialState: function() {
		return Object.assign(
			{
				login: '',
				password: '',
				auth_code: '',
			},
			AuthStore.get()
		);
	},

	submitForm: function( event ) {
		event.preventDefault();
		event.stopPropagation();

		AuthActions.login( this.state.login, this.state.password, this.state.auth_code );
	},

	hasLoginDetails: function() {
		if ( this.state.login === '' || this.state.password === '' ) {
			return false;
		}

		return true;
	},

	canSubmitForm: function() {
		// No submission until the ajax has finished
		if ( this.state.inProgress ) {
			return false;
		}

		// If we have 2fa set then don't allow submission until a code is entered
		if ( this.state.requires2fa ) {
			return parseInt( this.state.auth_code, 10 ) > 0;
		}

		// Don't allow submission until username+password is entered
		return this.hasLoginDetails();
	},

	toggleSelfHostedInstructions: function() {
		const isShowing = ! this.state.showInstructions;
		this.setState( { showInstructions: isShowing } );
	},

	render: function() {
		const { translate } = this.props;
		const { requires2fa, inProgress, errorMessage, errorLevel, showInstructions } = this.state;

		return (
			<Main className="auth">
				<div className="auth__content">
					<WordPressLogo />
					<form className="auth__form" onSubmit={ this.submitForm }>
						<FormFieldset>
							<div className="auth__input-wrapper">
								<Gridicon icon="user" />
								<FormTextInput
									name="login"
									disabled={ requires2fa || inProgress }
									placeholder={ translate( 'Email address or username' ) }
									onFocus={ this.getFocusHandler( 'Username or email address' ) }
									value={ this.state.login }
									onChange={ this.handleChange }
								/>
							</div>
							<div className="auth__input-wrapper">
								<Gridicon icon="lock" />
								<FormPasswordInput
									name="password"
									disabled={ requires2fa || inProgress }
									placeholder={ translate( 'Password' ) }
									onFocus={ this.getFocusHandler( 'Password' ) }
									hideToggle={ requires2fa }
									submitting={ inProgress }
									value={ this.state.password }
									onChange={ this.handleChange }
								/>
							</div>
							{ requires2fa && (
								<FormFieldset>
									<FormTextInput
										name="auth_code"
										type="number"
										ref={ this.focusInput }
										disabled={ inProgress }
										placeholder={ translate( 'Verification code' ) }
										onFocus={ this.getFocusHandler( 'Verification code' ) }
										value={ this.state.auth_code }
										onChange={ this.handleChange }
									/>
								</FormFieldset>
							) }
						</FormFieldset>
						<FormButtonsBar>
							<FormButton
								disabled={ ! this.canSubmitForm() }
								onClick={ this.getClickHandler( 'Sign in' ) }
							>
								{ requires2fa ? translate( 'Verify' ) : translate( 'Sign in' ) }
							</FormButton>
						</FormButtonsBar>
						{ ! requires2fa && <LostPassword /> }
						{ errorMessage && (
							<Notice text={ errorMessage } status={ errorLevel } showDismiss={ false } />
						) }
						{ requires2fa && (
							<AuthCodeButton username={ this.state.login } password={ this.state.password } />
						) }
					</form>
					<a
						className="auth__help"
						target="_blank"
						rel="noopener noreferrer"
						title={ translate( 'Visit the WordPress.com support site for help' ) }
						href="https://en.support.wordpress.com/"
					>
						<Gridicon icon="help" />
					</a>
					<div className="auth__links">
						<a href="#" onClick={ this.toggleSelfHostedInstructions }>
							{ translate( 'Add self-hosted site' ) }
						</a>
						<a href={ config( 'signup_url' ) }>{ translate( 'Create account' ) }</a>
					</div>
					{ showInstructions && (
						<SelfHostedInstructions onClickClose={ this.toggleSelfHostedInstructions } />
					) }
				</div>
			</Main>
		);
	},

	handleChange( e ) {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	},
} );

export default connect( null, {
	recordGoogleEvent,
} )( localize( Login ) );
