/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { defer } from 'lodash';
import PropTypes from 'prop-types';
import qs from 'qs';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SocialLoginForm from './social';
import Card from 'components/card';
import FormsButton from 'components/forms/form-button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormInputValidation from 'components/forms/form-input-validation';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';
import Notice from 'components/notice';
import config from 'config';
import { preventWidows } from 'lib/formatting';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUserId } from 'state/current-user/selectors';
import { loginUser, formUpdate } from 'state/login/actions';
import { getRequestError, isFormDisabled, getSocialAccountIsLinking, getSocialAccountLinkEmail, getSocialAccountLinkService } from 'state/login/selectors';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import { getCurrentQueryArguments } from 'state/ui/selectors';

export class LoginForm extends Component {
	static propTypes = {
		formUpdate: PropTypes.func.isRequired,
		isLoggedIn: PropTypes.bool.isRequired,
		loginUser: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		privateSite: PropTypes.bool,
		redirectTo: PropTypes.string,
		requestError: PropTypes.object,
		socialAccountIsLinking: PropTypes.bool,
		socialAccountLinkEmail: PropTypes.string,
		socialAccountLinkService: PropTypes.string,
		userEmail: PropTypes.string,
		translate: PropTypes.func.isRequired,
		isFormDisabled: PropTypes.bool,
		oauth2Client: PropTypes.object,
	};

	state = {
		isDisabledWhileLoading: true,
		usernameOrEmail: this.props.socialAccountLinkEmail || this.props.userEmail || '',
		password: '',
		rememberMe: false,
	};

	componentDidMount() {
		this.setState( { isDisabledWhileLoading: false }, () => { // eslint-disable-line react/no-did-mount-set-state
			this.usernameOrEmail.focus();
		} );
	}

	componentDidUpdate( prevProps ) {
		const { requestError } = this.props;

		if ( prevProps.requestError || ! requestError ) {
			return;
		}

		if ( requestError.field === 'password' ) {
			defer( () => this.password.focus() );
		}

		if ( requestError.field === 'usernameOrEmail' ) {
			defer( () => this.usernameOrEmail.focus() );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.socialAccountIsLinking !== nextProps.socialAccountIsLinking &&
			nextProps.socialAccountIsLinking ) {
			if ( ! this.state.usernameOrEmail ) {
				this.setState( { usernameOrEmail: nextProps.socialAccountLinkEmail } );
			}
		}
	}

	onChangeField = ( event ) => {
		this.props.formUpdate();
		this.setState( {
			[ event.target.name ]: event.target.value
		} );
	};

	onChangeRememberMe = ( event ) => {
		const { name, checked } = event.target;

		this.props.recordTracksEvent( 'calypso_login_block_remember_me_click', { new_value: checked } );

		this.setState( { [ name ]: checked } );
	};

	onSubmitForm = ( event ) => {
		event.preventDefault();

		const { usernameOrEmail, password } = this.state;
		const { onSuccess, redirectTo } = this.props;

		const rememberMe = this.props.socialAccountIsLinking ? true : this.state.rememberMe;

		this.props.recordTracksEvent( 'calypso_login_block_login_form_submit' );

		this.props.loginUser( usernameOrEmail, password, rememberMe, redirectTo ).then( () => {
			this.props.recordTracksEvent( 'calypso_login_block_login_form_success' );

			onSuccess();
		} ).catch( error => {
			this.props.recordTracksEvent( 'calypso_login_block_login_form_failure', {
				error_code: error.code,
				error_message: error.message
			} );
		} );
	};

	savePasswordRef = ( input ) => {
		this.password = input;
	};

	saveUsernameOrEmailRef = ( input ) => {
		this.usernameOrEmail = input;
	};

	renderPrivateSiteNotice() {
		if ( this.props.privateSite && ! this.props.isLoggedIn ) {
			return (
				<Notice status="is-info" showDismiss={ false } icon="lock">
					{ this.props.translate( 'Log in to WordPress.com to proceed. ' +
					"If you are not a member of this site, we'll send " +
					'your username to the site owner for approval.' ) }
				</Notice>
			);
		}
	}

	render() {
		const isDisabled = {};

		if ( this.state.isDisabledWhileLoading || this.props.isFormDisabled ) {
			isDisabled.disabled = true;
		}

		const { requestError, redirectTo, oauth2Client } = this.props;
		const linkingSocialUser = this.props.socialAccountIsLinking;
		const isOauthLogin = !! oauth2Client;
		let signupUrl = config( 'signup_url' );

		if ( isOauthLogin && config.isEnabled( 'signup/wpcc' ) ) {
			signupUrl = '/start/wpcc?' + qs.stringify( {
				oauth2_client_id: oauth2Client.id,
				oauth2_redirect: redirectTo
			} );
		}

		return (
			<form onSubmit={ this.onSubmitForm } method="post">
				{ this.renderPrivateSiteNotice() }

				<Card className="login__form">
					<div className="login__form-userdata">
						{ linkingSocialUser && (
							<div className="login__form-link-social-notice">
								<p>
									{ this.props.translate( 'We found a WordPress.com account with the email address "%(email)s". ' +
										'Log in to this account to connect it to your %(service)s profile.', {
											args: {
												email: this.props.socialAccountLinkEmail,
												service: this.props.socialAccountLinkService,
											}
										}
									) }
								</p>
							</div>
						) }
						<label htmlFor="usernameOrEmail" className="login__form-userdata-username">
							{ this.props.translate( 'Username or Email Address' ) }
						</label>

						<FormTextInput
							autoCapitalize="off"
							className={
								classNames( 'login__form-userdata-username-input', {
									'is-error': requestError && requestError.field === 'usernameOrEmail'
								} )
							}
							onChange={ this.onChangeField }
							id="usernameOrEmail"
							name="usernameOrEmail"
							ref={ this.saveUsernameOrEmailRef }
							value={ this.state.usernameOrEmail }
							{ ...isDisabled } />

						{ requestError && requestError.field === 'usernameOrEmail' && (
							<FormInputValidation isError text={ requestError.message } />
						) }

						<label htmlFor="password" className="login__form-userdata-username">
							{ this.props.translate( 'Password' ) }
						</label>

						<FormPasswordInput
							autoCapitalize="off"
							autoComplete="off"
							className={
								classNames( 'login__form-userdata-username-password', {
									'is-error': requestError && requestError.field === 'password'
								} )
							}
							onChange={ this.onChangeField }
							id="password"
							name="password"
							ref={ this.savePasswordRef }
							value={ this.state.password }
							{ ...isDisabled } />

						{ requestError && requestError.field === 'password' && (
							<FormInputValidation isError text={ requestError.message } />
						) }
					</div>

					{ ! linkingSocialUser && (
						<div className="login__form-remember-me">
							<label>
								<FormCheckbox
									name="rememberMe"
									checked={ this.state.rememberMe }
									onChange={ this.onChangeRememberMe }
									{ ...isDisabled } />
								<span>{ this.props.translate( 'Keep me logged in' ) }</span>
							</label>
						</div>
					) }

					{ config.isEnabled( 'signup/social' ) && (
					<p className="login__form-terms">
						{
							preventWidows( this.props.translate(
								// To make any changes to this copy please speak to the legal team
								'By logging in via any of the options below, you agree to our {{tosLink}}Terms of Service{{/tosLink}}.',
								{
									components: {
										tosLink: <a href="//wordpress.com/tos/" target="_blank" rel="noopener noreferrer" />,
									}
								}
							), 5 )

						}
					</p>
					) }

					<div className="login__form-action">
						<FormsButton primary { ...isDisabled }>
							{ this.props.translate( 'Log In' ) }
						</FormsButton>
					</div>

					{ isOauthLogin && (
						<div className={ classNames( 'login__form-signup-link' ) }>
							{ this.props.translate( 'Not on WordPress.com? {{signupLink}}Create an Account{{/signupLink}}.',
								{
									components: {
										signupLink: <a href={ signupUrl } />,
									}
								}
							) }
						</div>
					) }
				</Card>
				{ config.isEnabled( 'signup/social' ) && (
					<Card className="login__form-social">
						<SocialLoginForm
							onSuccess={ this.props.onSuccess }
							linkingSocialService={ this.props.socialAccountIsLinking
								? this.props.socialAccountLinkService
								: null
							} />
					</Card>
				) }
			</form>
		);
	}
}

export default connect(
	( state ) => ( {
		redirectTo: getCurrentQueryArguments( state ).redirect_to,
		userEmail: getCurrentQueryArguments( state ).email_address,
		requestError: getRequestError( state ),
		isFormDisabled: isFormDisabled( state ),
		socialAccountIsLinking: getSocialAccountIsLinking( state ),
		socialAccountLinkEmail: getSocialAccountLinkEmail( state ),
		socialAccountLinkService: getSocialAccountLinkService( state ),
		isLoggedIn: Boolean( getCurrentUserId( state ) ),
		oauth2Client: getCurrentOAuth2Client( state ),
	} ),
	{
		formUpdate,
		loginUser,
		recordTracksEvent,
	}
)( localize( LoginForm ) );
