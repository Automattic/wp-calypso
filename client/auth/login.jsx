/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'calypso/components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import AuthCodeButton from './auth-code-button';
import config from 'calypso/config';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LostPassword from './lost-password';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import SelfHostedInstructions from './self-hosted-instructions';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import * as OAuthToken from 'calypso/lib/oauth-token';
import { errorTypes, makeAuthRequest, bumpStats } from './login-request';

const debug = debugFactory( 'calypso:oauth' );

export class Auth extends Component {
	state = {
		login: '',
		password: '',
		auth_code: '',
		requires2fa: false,
		inProgress: false,
		errorLevel: false,
		errorMessage: false,
	};

	getClickHandler = ( action ) => () =>
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

	getFocusHandler = ( action ) => () =>
		this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );

	focusInput = ( input ) => {
		if ( this.state.requires2fa && this.state.inProgress === false ) {
			input.focus();
		}
	};

	handleAuthError = ( error ) => {
		const stateChanges = {
			errorLevel: 'is-error',
			requires2fa: false,
			inProgress: false,
			errorMessage: error.message,
		};

		debug( 'Error processing login: ' + stateChanges.errorMessage );

		bumpStats( error );

		if ( error.type === errorTypes.ERROR_REQUIRES_2FA ) {
			stateChanges.requires2fa = true;
			stateChanges.errorLevel = 'is-info';
		} else if ( error.type === errorTypes.ERROR_INVALID_OTP ) {
			stateChanges.requires2fa = true;
		}

		this.setState( stateChanges );
	};

	handleLogin = ( response ) => {
		debug( 'Access token received' );

		bumpStats();

		OAuthToken.setToken( response.body.access_token );

		document.location.replace( '/' );
	};

	submitForm = async ( event ) => {
		event.preventDefault();
		event.stopPropagation();

		this.setState( { inProgress: true, errorLevel: false, errorMessage: false } );

		try {
			const { login, password, auth_code } = this.state;
			const response = await makeAuthRequest( login, password, auth_code.replace( /\s/g, '' ) );

			this.handleLogin( response );
		} catch ( error ) {
			this.handleAuthError( error );
		}
	};

	toggleSelfHostedInstructions = () => {
		const isShowing = ! this.state.showInstructions;
		this.setState( { showInstructions: isShowing } );
	};

	handleChange = ( event ) => {
		const { name, value } = event.currentTarget;

		if ( name === 'auth_code' ) {
			this.setState( { auth_code: value } );
			return;
		}

		this.setState( { [ name ]: value } );
	};

	canSubmitForm() {
		// No submission until the ajax has finished
		return ! this.state.inProgress;
	}

	render() {
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
										autoComplete="off"
										name="auth_code"
										type="tel"
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
						href={ localizeUrl( 'https://wordpress.com/support/' ) }
					>
						<Gridicon icon="help" />
					</a>
					<div className="auth__links">
						<button onClick={ this.toggleSelfHostedInstructions }>
							{ translate( 'Add self-hosted site' ) }
						</button>
						<a href={ config( 'signup_url' ) }>{ translate( 'Create account' ) }</a>
					</div>
					{ showInstructions && (
						<SelfHostedInstructions onClickClose={ this.toggleSelfHostedInstructions } />
					) }
				</div>
			</Main>
		);
	}
}

export default connect( null, { recordGoogleEvent } )( localize( Auth ) );
