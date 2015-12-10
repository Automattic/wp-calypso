/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import Notice from 'components/notice';
import AuthStore from 'lib/oauth-store';
import * as AuthActions from 'lib/oauth-store/actions';
import eventRecorder from 'me/event-recorder';
import Gridicon from 'components/gridicon';
import WordPressLogo from 'components/wordpress-logo';
import AuthCodeButton from './auth-code-button';

const LostPassword = React.createClass( {
	render: function() {
		return (
			<p className="auth__lost-password">
				<a href="https://wordpress.com/wp-login.php?action=lostpassword" target="_blank">
					{ this.translate( 'Lost your password?' ) }
				</a>
			</p>
		);
	}
} );

module.exports = React.createClass( {
	displayName: 'Auth',

	mixins: [ React.addons.LinkedStateMixin, eventRecorder ],

	componentDidMount: function() {
		AuthStore.on( 'change', this.refreshData );
	},

	componentWillUnmount: function() {
		AuthStore.off( 'change', this.refreshData );
	},

	refreshData: function() {
		this.setState( AuthStore.get() );
	},

	componentDidUpdate() {
		if ( this.state.requires2fa && this.state.inProgress === false ) {
			this.refs.auth_code.getDOMNode().focus();
		}
	},

	getInitialState: function() {
		return Object.assign( {
			login: '',
			password: '',
			auth_code: ''
		}, AuthStore.get() );
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

	render: function() {
		const { requires2fa, inProgress, errorMessage, errorLevel } = this.state;

		return (
			<Main className="auth">
				<WordPressLogo />
				<form className="auth__form" onSubmit={ this.submitForm }>
					<FormFieldset>
						<div className="auth__input-wrapper">
							<Gridicon icon="user"/>
							<FormTextInput
								name="login"
								ref="login"
								disabled={ requires2fa || inProgress }
								placeholder={ this.translate( 'Username or email address' ) }
								onFocus={ this.recordFocusEvent( 'Username or email address' ) }
								valueLink={ this.linkState( 'login' ) } />
						</div>
						<div className="auth__input-wrapper">
							<Gridicon icon="lock" />
							<FormPasswordInput
								name="password"
								ref="password"
								disabled={ requires2fa || inProgress }
								placeholder={ this.translate( 'Password' ) }
								onFocus={ this.recordFocusEvent( 'Password' ) }
								hideToggle={ requires2fa }
								submitting={ inProgress }
								valueLink={ this.linkState( 'password' ) } />
						</div>
						{ requires2fa &&
							<FormFieldset>
								<FormTextInput
									name="auth_code"
									type="number"
									ref="auth_code"
									disabled={ inProgress }
									placeholder={ this.translate( 'Verification code' ) }
									onFocus={ this.recordFocusEvent( 'Verification code' ) }
									valueLink={ this.linkState( 'auth_code' ) } />
							</FormFieldset>
						}
					</FormFieldset>
					<FormButtonsBar>
						<FormButton disabled={ ! this.canSubmitForm() } onClick={ this.recordClickEvent( 'Sign in' ) } >
							{ requires2fa ? this.translate( 'Verify' ) : this.translate( 'Sign in' ) }
						</FormButton>
					</FormButtonsBar>
					{ ! requires2fa && <LostPassword /> }
					{ errorMessage && <Notice text={ errorMessage } status={ errorLevel } showDismiss={ false } /> }
					{ requires2fa && <AuthCodeButton username={ this.state.login } password={ this.state.password } /> }
				</form>
				<a className="auth__help" target="_blank" title={ this.translate( 'Visit the WordPress.com support site for help' ) } href="https://en.support.wordpress.com/">
					<Gridicon icon="help" />
				</a>
				<div className="auth__links">
					<a href="https://jetpack.me/support/site-management/" target="_blank">{ this.translate( 'Add self-hosted site' ) }</a>
					<a href="https://wordpress.com/signup" target="_blank">{ this.translate( 'Create account' ) }</a>
				</div>
			</Main>
		);
	}
} );
