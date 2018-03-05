/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import { capitalize, defer, includes } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import qs from 'qs';

/**
 * Internal dependencies
 */
import config from 'config';
import FormsButton from 'components/forms/form-button';
import FormInputValidation from 'components/forms/form-input-validation';
import Card from 'components/card';
import { fetchMagicLoginRequestEmail } from 'state/login/magic-login/actions';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';
import getInitialQueryArguments from 'state/selectors/get-initial-query-arguments';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import {
	formUpdate,
	getAuthAccountType,
	loginUser,
	resetAuthAccountType,
} from 'state/login/actions';
import { login } from 'lib/paths';
import { preventWidows } from 'lib/formatting';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import {
	getAuthAccountType as getAuthAccountTypeSelector,
	getRedirectToOriginal,
	getRequestError,
	getSocialAccountIsLinking,
	getSocialAccountLinkEmail,
	getSocialAccountLinkService,
	isFormDisabled as isFormDisabledSelector,
} from 'state/login/selectors';
import { isPasswordlessAccount, isRegularAccount } from 'state/login/utils';
import Notice from 'components/notice';
import SocialLoginForm from './social';

export class LoginForm extends Component {
	static propTypes = {
		accountType: PropTypes.string,
		disableAutoFocus: PropTypes.bool,
		fetchMagicLoginRequestEmail: PropTypes.func.isRequired,
		formUpdate: PropTypes.func.isRequired,
		getAuthAccountType: PropTypes.func.isRequired,
		hasAccountTypeLoaded: PropTypes.bool.isRequired,
		isFormDisabled: PropTypes.bool,
		isLoggedIn: PropTypes.bool.isRequired,
		loginUser: PropTypes.func.isRequired,
		oauth2Client: PropTypes.object,
		onSuccess: PropTypes.func.isRequired,
		privateSite: PropTypes.bool,
		redirectTo: PropTypes.string,
		requestError: PropTypes.object,
		resetAuthAccountType: PropTypes.func.isRequired,
		socialAccountIsLinking: PropTypes.bool,
		socialAccountLinkEmail: PropTypes.string,
		socialAccountLinkService: PropTypes.string,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		translate: PropTypes.func.isRequired,
		userEmail: PropTypes.string,
	};

	state = {
		isFormDisabledWhileLoading: true,
		usernameOrEmail: this.props.socialAccountLinkEmail || this.props.userEmail || '',
		password: '',
	};

	componentDidMount() {
		const { disableAutoFocus } = this.props;
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( { isFormDisabledWhileLoading: false }, () => {
			! disableAutoFocus && this.usernameOrEmail && this.usernameOrEmail.focus();
		} );
	}

	componentDidUpdate( prevProps ) {
		const { disableAutoFocus, requestError } = this.props;

		if ( prevProps.requestError || ! requestError ) {
			return;
		}

		if ( requestError.field === 'password' ) {
			! disableAutoFocus && defer( () => this.password && this.password.focus() );
		}

		if ( requestError.field === 'usernameOrEmail' ) {
			! disableAutoFocus && defer( () => this.usernameOrEmail && this.usernameOrEmail.focus() );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { disableAutoFocus } = this.props;

		if (
			this.props.socialAccountIsLinking !== nextProps.socialAccountIsLinking &&
			nextProps.socialAccountIsLinking
		) {
			if ( ! this.state.usernameOrEmail ) {
				this.setState( { usernameOrEmail: nextProps.socialAccountLinkEmail } );
			}
		}

		if ( this.props.hasAccountTypeLoaded && ! nextProps.hasAccountTypeLoaded ) {
			this.setState( { password: '' } );

			! disableAutoFocus && defer( () => this.usernameOrEmail && this.usernameOrEmail.focus() );
		}

		if ( ! this.props.hasAccountTypeLoaded && isRegularAccount( nextProps.accountType ) ) {
			! disableAutoFocus && defer( () => this.password && this.password.focus() );
		}

		if ( ! this.props.hasAccountTypeLoaded && isPasswordlessAccount( nextProps.accountType ) ) {
			this.props.recordTracksEvent( 'calypso_login_block_login_form_send_magic_link' );

			this.props
				.fetchMagicLoginRequestEmail( this.state.usernameOrEmail, nextProps.redirectTo )
				.then( () => {
					this.props.recordTracksEvent( 'calypso_login_block_login_form_send_magic_link_success' );
				} )
				.catch( error => {
					this.props.recordTracksEvent( 'calypso_login_block_login_form_send_magic_link_failure', {
						error_code: error.error,
						error_message: error.message,
					} );
				} );

			page( login( { isNative: true, twoFactorAuthType: 'link' } ) );
		}
	}

	onChangeField = event => {
		this.props.formUpdate();

		this.setState( {
			[ event.target.name ]: event.target.value,
		} );
	};

	isFullView() {
		const { accountType, hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return socialAccountIsLinking || ( hasAccountTypeLoaded && isRegularAccount( accountType ) );
	}

	isPasswordView() {
		const { accountType, hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return ! socialAccountIsLinking && hasAccountTypeLoaded && isRegularAccount( accountType );
	}

	isUsernameOrEmailView() {
		const { hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return ! socialAccountIsLinking && ! hasAccountTypeLoaded;
	}

	resetView = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_block_login_form_change_username_or_email' );

		this.props.resetAuthAccountType();
	};

	loginUser() {
		const { password, usernameOrEmail } = this.state;
		const { onSuccess, redirectTo } = this.props;

		this.props.recordTracksEvent( 'calypso_login_block_login_form_submit' );

		this.props
			.loginUser( usernameOrEmail, password, redirectTo )
			.then( () => {
				this.props.recordTracksEvent( 'calypso_login_block_login_form_success' );

				onSuccess( redirectTo );
			} )
			.catch( error => {
				this.props.recordTracksEvent( 'calypso_login_block_login_form_failure', {
					error_code: error.code,
					error_message: error.message,
				} );
			} );
	}

	onSubmitForm = event => {
		event.preventDefault();

		if ( ! this.props.hasAccountTypeLoaded ) {
			this.props.getAuthAccountType( this.state.usernameOrEmail );

			return;
		}

		this.loginUser();
	};

	shouldUseRedirectLoginFlow() {
		const { oauth2Client } = this.props;
		// If calypso is loaded in a popup, we don't want to open a second popup for social login
		// let's use the redirect flow instead in that case
		const isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;
		// disable for oauth2 flows for now
		return ! oauth2Client && isPopup;
	}

	savePasswordRef = input => {
		this.password = input;
	};

	saveUsernameOrEmailRef = input => {
		this.usernameOrEmail = input;
	};

	renderPrivateSiteNotice() {
		if ( this.props.privateSite && ! this.props.isLoggedIn ) {
			return (
				<Notice status="is-info" showDismiss={ false } icon="lock">
					{ this.props.translate(
						'Log in to WordPress.com to proceed. ' +
							"If you are not a member of this site, we'll send " +
							'your username to the site owner for approval.'
					) }
				</Notice>
			);
		}
	}

	render() {
		const isFormDisabled = this.state.isFormDisabledWhileLoading || this.props.isFormDisabled;

		const {
			oauth2Client,
			redirectTo,
			requestError,
			socialAccountIsLinking: linkingSocialUser,
		} = this.props;
		const isOauthLogin = !! oauth2Client;

		let signupUrl = config( 'signup_url' );

		if ( isOauthLogin && config.isEnabled( 'signup/wpcc' ) ) {
			signupUrl =
				'/start/wpcc?' +
				qs.stringify( {
					oauth2_client_id: oauth2Client.id,
					oauth2_redirect: redirectTo,
				} );
		}

		return (
			<form onSubmit={ this.onSubmitForm } method="post">
				{ this.renderPrivateSiteNotice() }

				<Card className="login__form">
					<div className="login__form-userdata">
						{ linkingSocialUser && (
							<p>
								{ this.props.translate(
									'We found a WordPress.com account with the email address "%(email)s". ' +
										'Log in to this account to connect it to your %(service)s profile, ' +
										'or choose a different %(service)s profile.',
									{
										args: {
											email: this.props.socialAccountLinkEmail,
											service: capitalize( this.props.socialAccountLinkService ),
										},
									}
								) }
							</p>
						) }

						<label htmlFor="usernameOrEmail">
							{ this.isPasswordView() ? (
								<a href="#" className="login__form-change-username" onClick={ this.resetView }>
									<Gridicon icon="arrow-left" size={ 18 } />

									{ includes( this.state.usernameOrEmail, '@' )
										? this.props.translate( 'Change Email Address' )
										: this.props.translate( 'Change Username' ) }
								</a>
							) : (
								this.props.translate( 'Email Address or Username' )
							) }
						</label>

						<FormTextInput
							autoCapitalize="off"
							className={ classNames( {
								'is-error': requestError && requestError.field === 'usernameOrEmail',
							} ) }
							onChange={ this.onChangeField }
							id="usernameOrEmail"
							name="usernameOrEmail"
							ref={ this.saveUsernameOrEmailRef }
							value={ this.state.usernameOrEmail }
							disabled={ isFormDisabled || this.isPasswordView() }
						/>

						{ requestError &&
							requestError.field === 'usernameOrEmail' && (
								<FormInputValidation isError text={ requestError.message } />
							) }

						<div
							className={ classNames( 'login__form-password', {
								'is-hidden': this.isUsernameOrEmailView(),
							} ) }
						>
							<label htmlFor="password">{ this.props.translate( 'Password' ) }</label>

							<FormPasswordInput
								autoCapitalize="off"
								autoComplete="off"
								className={ classNames( {
									'is-error': requestError && requestError.field === 'password',
								} ) }
								onChange={ this.onChangeField }
								id="password"
								name="password"
								ref={ this.savePasswordRef }
								value={ this.state.password }
								disabled={ isFormDisabled }
							/>

							{ requestError &&
								requestError.field === 'password' && (
									<FormInputValidation isError text={ requestError.message } />
								) }
						</div>
					</div>

					{ config.isEnabled( 'signup/social' ) && (
						<p className="login__form-terms">
							{ preventWidows(
								this.props.translate(
									// To make any changes to this copy please speak to the legal team
									'By continuing with any of the options below, ' +
										'you agree to our {{tosLink}}Terms of Service{{/tosLink}}.',
									{
										components: {
											tosLink: (
												<a href="//wordpress.com/tos/" target="_blank" rel="noopener noreferrer" />
											),
										},
									}
								),
								5
							) }
						</p>
					) }

					<div className="login__form-action">
						<FormsButton primary disabled={ isFormDisabled }>
							{ this.isPasswordView() || this.isFullView()
								? this.props.translate( 'Log In' )
								: this.props.translate( 'Continue' ) }
						</FormsButton>
					</div>

					{ isOauthLogin && (
						<div className={ classNames( 'login__form-signup-link' ) }>
							{ this.props.translate(
								'Not on WordPress.com? {{signupLink}}Create an Account{{/signupLink}}.',
								{
									components: {
										signupLink: <a href={ signupUrl } />,
									},
								}
							) }
						</div>
					) }
				</Card>

				{ config.isEnabled( 'signup/social' ) && (
					<div className="login__form-social">
						<div className="login__form-social-divider">
							<span>{ this.props.translate( 'or' ) }</span>
						</div>

						<Card>
							<SocialLoginForm
								onSuccess={ this.props.onSuccess }
								socialService={ this.props.socialService }
								socialServiceResponse={ this.props.socialServiceResponse }
								linkingSocialService={
									this.props.socialAccountIsLinking ? this.props.socialAccountLinkService : null
								}
								uxMode={ this.shouldUseRedirectLoginFlow() ? 'redirect' : 'popup' }
							/>
						</Card>
					</div>
				) }
			</form>
		);
	}
}

export default connect(
	state => {
		const accountType = getAuthAccountTypeSelector( state );

		return {
			accountType,
			hasAccountTypeLoaded: accountType !== null,
			isFormDisabled: isFormDisabledSelector( state ),
			isLoggedIn: Boolean( getCurrentUserId( state ) ),
			oauth2Client: getCurrentOAuth2Client( state ),
			redirectTo: getRedirectToOriginal( state ),
			requestError: getRequestError( state ),
			socialAccountIsLinking: getSocialAccountIsLinking( state ),
			socialAccountLinkEmail: getSocialAccountLinkEmail( state ),
			socialAccountLinkService: getSocialAccountLinkService( state ),
			userEmail: getInitialQueryArguments( state ).email_address,
		};
	},
	{
		fetchMagicLoginRequestEmail,
		formUpdate,
		getAuthAccountType,
		loginUser,
		recordTracksEvent,
		resetAuthAccountType,
	}
)( localize( LoginForm ) );
