/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AuthCodeButton from './auth-code-button';
import AuthStore from 'lib/oauth-store';
import config from 'config';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormFieldset from 'components/forms/form-fieldset';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';
import LostPassword from './lost-password';
import Main from 'components/main';
import Notice from 'components/notice';
import SelfHostedInstructions from './self-hosted-instructions';
import WordPressLogo from 'components/wordpress-logo';
import { login } from 'lib/oauth-store/actions';
import { recordGoogleEvent } from 'state/analytics/actions';
import { localizeUrl } from 'lib/i18n-utils';

export class Auth extends Component {
	state = {
		login: '',
		password: '',
		auth_code: '',
		...AuthStore.get(),
	};

	componentDidMount() {
		AuthStore.on( 'change', this.refreshData );
	}

	componentWillUnmount() {
		AuthStore.off( 'change', this.refreshData );
	}

	getClickHandler = action => () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

	getFocusHandler = action => () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );

	refreshData = () => {
		this.setState( AuthStore.get() );
	};

	focusInput = input => {
		if ( this.state.requires2fa && this.state.inProgress === false ) {
			input.focus();
		}
	};

	submitForm = event => {
		event.preventDefault();
		event.stopPropagation();

		login( this.state.login, this.state.password, this.state.auth_code );
	};

	toggleSelfHostedInstructions = () => {
		const isShowing = ! this.state.showInstructions;
		this.setState( { showInstructions: isShowing } );
	};

	handleChange = event => {
		const { name, value } = event.currentTarget;

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

export default connect( null, {
	recordGoogleEvent,
} )( localize( Auth ) );
