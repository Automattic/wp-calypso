/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
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
import eventRecorder from 'me/event-recorder';
import WordPressLogo from 'components/wordpress-logo';
import AuthCodeButton from './auth-code-button';
import { addLocaleToWpcomUrl, getLocaleSlug } from 'lib/i18n-utils';

const LostPassword = localize( React.createClass( {
	render: function() {
		const url = addLocaleToWpcomUrl( 'https://wordpress.com/wp-login.php?action=lostpassword', getLocaleSlug() );
		return (
		    <p className="auth__lost-password">
				<a href={ url } target="_blank" rel="noopener noreferrer">
					{ this.props.translate( 'Lost your password?' ) }
				</a>
			</p>
		);
	}
} ) );

const SelfHostedInstructions = localize( React.createClass( {

	render: function() {
		return (
		    <div className="auth__self-hosted-instructions">
				<a href="#" onClick={ this.props.onClickClose } className="auth__self-hosted-instructions-close"><Gridicon icon="cross" size={ 24 } /></a>

				<h2>{ this.props.translate( 'Add self-hosted site' ) }</h2>
				<p>{ this.props.translate( 'By default when you sign into the WordPress.com app, you can edit blogs and sites hosted at WordPress.com' ) }</p>
				<p>{ this.props.translate( 'If you\'d like to edit your self-hosted WordPress blog or site, you can do that by following these instructions:' ) }</p>

				<ol>
					<li><strong>{ this.props.translate( 'Install the Jetpack plugin.' ) }</strong><br /><a href="http://jetpack.me/install/">{ this.props.translate( 'Please follow these instructions to install Jetpack' ) }</a>.</li>
					<li>{ this.props.translate( 'Connect Jetpack to WordPress.com.' ) }</li>
					<li>{ this.props.translate( 'Now you can sign in to the app using the WordPress.com account Jetpack is connected to, and you can find your self-hosted site under the "My Sites" section.' ) }</li>
				</ol>
			</div>
		);
	}
} ) );

export default localize( React.createClass( {
	displayName: 'Auth',

	mixins: [ LinkedStateMixin, eventRecorder ],

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
			ReactDom.findDOMNode( this.refs.auth_code ).focus();
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

	toggleSelfHostedInstructions: function() {
		const isShowing = ! this.state.showInstructions;
		this.setState( { showInstructions: isShowing } );
	},

	render: function() {
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
									ref="login"
									disabled={ requires2fa || inProgress }
									placeholder={ this.props.translate( 'Username or email address' ) }
									onFocus={ this.recordFocusEvent( 'Username or email address' ) }
									valueLink={ this.linkState( 'login' ) } />
							</div>
							<div className="auth__input-wrapper">
								<Gridicon icon="lock" />
								<FormPasswordInput
									name="password"
									ref="password"
									disabled={ requires2fa || inProgress }
									placeholder={ this.props.translate( 'Password' ) }
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
										placeholder={ this.props.translate( 'Verification code' ) }
										onFocus={ this.recordFocusEvent( 'Verification code' ) }
										valueLink={ this.linkState( 'auth_code' ) } />
								</FormFieldset>
							}
						</FormFieldset>
						<FormButtonsBar>
							<FormButton disabled={ ! this.canSubmitForm() } onClick={ this.recordClickEvent( 'Sign in' ) } >
								{ requires2fa ? this.props.translate( 'Verify' ) : this.props.translate( 'Sign in' ) }
							</FormButton>
						</FormButtonsBar>
						{ ! requires2fa && <LostPassword /> }
						{ errorMessage && <Notice text={ errorMessage } status={ errorLevel } showDismiss={ false } /> }
						{ requires2fa && <AuthCodeButton username={ this.state.login } password={ this.state.password } /> }
					</form>
					<a className="auth__help" target="_blank" rel="noopener noreferrer" title={ this.props.translate( 'Visit the WordPress.com support site for help' ) } href="https://en.support.wordpress.com/">
						<Gridicon icon="help" />
					</a>
					<div className="auth__links">
						<a href="#" onClick={ this.toggleSelfHostedInstructions }>{ this.props.translate( 'Add self-hosted site' ) }</a>
						<a href={ config( 'signup_url' ) }>{ this.props.translate( 'Create account' ) }</a>
					</div>
					{ showInstructions && <SelfHostedInstructions onClickClose={ this.toggleSelfHostedInstructions } /> }
				</div>
			</Main>
		);
	}
} ) );
