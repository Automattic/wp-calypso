import config from '@automattic/calypso-config';
import { Button, Card, FormInputValidation, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { capitalize, defer, includes, get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import JetpackConnectSiteOnly from 'calypso/blocks/jetpack-connect-site-only';
import FormsButton from 'calypso/components/forms/form-button';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import TextControl from 'calypso/components/text-control';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import {
	getSignupUrl,
	pathWithLeadingSlash,
	isReactLostPasswordScreenEnabled,
} from 'calypso/lib/login';
import { isCrowdsignalOAuth2Client, isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login, lostPassword } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	formUpdate,
	getAuthAccountType,
	loginUser,
	resetAuthAccountType,
} from 'calypso/state/login/actions';
import {
	getAuthAccountType as getAuthAccountTypeSelector,
	getRedirectToOriginal,
	getRequestError,
	getSocialAccountIsLinking,
	getSocialAccountLinkEmail,
	getSocialAccountLinkService,
	isFormDisabled as isFormDisabledSelector,
} from 'calypso/state/login/selectors';
import { isPartnerSignupQuery, isRegularAccount } from 'calypso/state/login/utils';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import Divider from './divider';
import SocialLoginForm from './social';

export class LoginForm extends Component {
	static propTypes = {
		accountType: PropTypes.string,
		disableAutoFocus: PropTypes.bool,
		sendEmailLogin: PropTypes.func.isRequired,
		formUpdate: PropTypes.func.isRequired,
		getAuthAccountType: PropTypes.func.isRequired,
		hasAccountTypeLoaded: PropTypes.bool.isRequired,
		isFormDisabled: PropTypes.bool,
		isLoggedIn: PropTypes.bool.isRequired,
		loginUser: PropTypes.func.isRequired,
		handleUsernameChange: PropTypes.func,
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
		isWhiteLogin: PropTypes.bool,
		isPartnerSignup: PropTypes.bool,
		locale: PropTypes.string,
		showSocialLoginFormOnly: PropTypes.bool,
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

	componentDidUpdate( prevProps, prevState ) {
		const { currentRoute, disableAutoFocus, requestError, handleUsernameChange } = this.props;

		if ( handleUsernameChange && prevState.usernameOrEmail !== this.state.usernameOrEmail ) {
			handleUsernameChange( this.state.usernameOrEmail );
		}

		if ( prevProps.requestError || ! requestError ) {
			return;
		}

		if ( requestError.field === 'password' ) {
			! disableAutoFocus && defer( () => this.password && this.password.focus() );
		}

		if ( requestError.field === 'usernameOrEmail' ) {
			! disableAutoFocus && defer( () => this.usernameOrEmail && this.usernameOrEmail.focus() );
		}

		// User entered an email address or username that doesn't have a corresponding WPCOM account
		// and sign-up with magic links is enabled.
		if (
			currentRoute &&
			currentRoute.includes( '/log-in/jetpack' ) &&
			config.isEnabled( 'jetpack/magic-link-signup' ) &&
			requestError.code === 'unknown_user'
		) {
			this.jetpackCreateAccountWithMagicLink();
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { disableAutoFocus } = this.props;

		if (
			this.props.socialAccountIsLinking !== nextProps.socialAccountIsLinking &&
			nextProps.socialAccountIsLinking
		) {
			this.setState( { usernameOrEmail: nextProps.socialAccountLinkEmail } );
			this.props.getAuthAccountType( nextProps.socialAccountLinkEmail );
		}

		if ( this.props.hasAccountTypeLoaded && ! nextProps.hasAccountTypeLoaded ) {
			this.setState( { password: '' } );

			! disableAutoFocus && defer( () => this.usernameOrEmail && this.usernameOrEmail.focus() );
		}

		if ( ! this.props.hasAccountTypeLoaded && isRegularAccount( nextProps.accountType ) ) {
			! disableAutoFocus && defer( () => this.password && this.password.focus() );
		}
	}

	onChangeField = ( event ) => {
		this.props.formUpdate();

		this.setState( {
			[ event.target.name ]: event.target.value,
		} );
	};

	isFullView() {
		const { accountType, hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return (
			socialAccountIsLinking ||
			( hasAccountTypeLoaded && isRegularAccount( accountType ) ) ||
			( this.props.isWoo && ! this.props.isPartnerSignup )
		);
	}

	isPasswordView() {
		const { accountType, hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return (
			! socialAccountIsLinking &&
			hasAccountTypeLoaded &&
			isRegularAccount( accountType ) &&
			! ( this.props.isWoo && ! this.props.isPartnerSignup )
		);
	}

	isUsernameOrEmailView() {
		const { hasAccountTypeLoaded, socialAccountIsLinking } = this.props;

		return (
			! socialAccountIsLinking &&
			! hasAccountTypeLoaded &&
			! ( this.props.isWoo && ! this.props.isPartnerSignup )
		);
	}

	resetView = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_block_login_form_change_username_or_email' );

		this.props.resetAuthAccountType();
	};

	loginUser() {
		const { password, usernameOrEmail } = this.state;
		const { onSuccess, redirectTo, domain } = this.props;

		this.props.recordTracksEvent( 'calypso_login_block_login_form_submit' );

		this.props
			.loginUser( usernameOrEmail, password, redirectTo, domain )
			.then( () => {
				this.props.recordTracksEvent( 'calypso_login_block_login_form_success' );
				onSuccess( redirectTo );
			} )
			.catch( ( error ) => {
				this.props.recordTracksEvent( 'calypso_login_block_login_form_failure', {
					error_code: error.code,
					error_message: error.message,
				} );
			} );
	}

	onSubmitForm = ( event ) => {
		event.preventDefault();

		const isWooAndNotPartnerSignup = this.props.isWoo && ! this.props.isPartnerSignup;

		// Skip this step if we're in the Woo and not the partner signup flow, and hasAccountTypeLoaded.
		if ( ! isWooAndNotPartnerSignup && ! this.props.hasAccountTypeLoaded ) {
			// Google Chrome on iOS will autofill without sending events, leading the user
			// to see a filled box but getting an error. We fetch the value directly from
			// the DOM as a workaround.
			const usernameOrEmail = ReactDom.findDOMNode( this.usernameOrEmail ).value;

			this.props.getAuthAccountType( usernameOrEmail );

			this.setState( {
				usernameOrEmail,
			} );

			return;
		}

		this.loginUser();
	};

	shouldUseRedirectLoginFlow() {
		const { currentRoute, oauth2Client } = this.props;
		// If calypso is loaded in a popup, we don't want to open a second popup for social login
		// let's use the redirect flow instead in that case
		let isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;

		// Jetpack Connect-in-place auth flow contains special reserved args, so we want a popup for social login.
		// See p1HpG7-7nj-p2 for more information.
		if ( isPopup && '/log-in/jetpack' === currentRoute ) {
			isPopup = false;
		}

		// disable for oauth2 flows for now
		return ! oauth2Client && isPopup;
	}

	savePasswordRef = ( input ) => {
		this.password = input;
	};

	saveUsernameOrEmailRef = ( input ) => {
		this.usernameOrEmail = input;
	};

	jetpackCreateAccountWithMagicLink() {
		// When a user enters a username or an email address that doesn't have a corresponding
		// WPCOM account, we need to figure out whether the user entered a username or an email
		// address. If the user entered an email address, we can safely attempt to create a WPCOM
		// account for this user with the help of magic links. On the other hand, if the user entered
		// a username, we need to prompt the user specifically for an email address to proceed with
		// the WPCOM account creation with magic links.

		const isEmailAddress = includes( this.state.usernameOrEmail, '@' );
		if ( isEmailAddress ) {
			// With Magic Links, create the user a WPCOM account linked to the entered email address
			this.props.sendEmailLogin( this.state.usernameOrEmail, {
				redirectTo: this.props.redirectTo,
				requestLoginEmailFormFlow: true,
				createAccount: true,
				flow: 'jetpack',
			} );
		}

		// Redirect user to the Magic Link form page
		page(
			addQueryArgs(
				{
					email_address: this.state.usernameOrEmail,
				},
				'/log-in/jetpack/link'
			)
		);
	}

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

	onWooCommerceSocialSuccess = ( ...args ) => {
		this.recordWooCommerceLoginTracks( 'social' );
		this.props.onSuccess( args );
	};

	recordWooCommerceLoginTracks( method ) {
		const { isJetpackWooCommerceFlow, isWoo, wccomFrom } = this.props;
		if ( isJetpackWooCommerceFlow ) {
			this.props.recordTracksEvent( 'wcadmin_storeprofiler_login_jetpack_account', {
				login_method: method,
			} );
		} else if ( isWoo && 'cart' === wccomFrom ) {
			this.props.recordTracksEvent( 'wcadmin_storeprofiler_payment_login', {
				login_method: method,
			} );
		}
	}

	handleWooCommerceSubmit = ( event ) => {
		event.preventDefault();
		document.activeElement.blur();
		if ( ! this.props.hasAccountTypeLoaded ) {
			this.props.getAuthAccountType( this.state.usernameOrEmail );
			return;
		}
		this.recordWooCommerceLoginTracks( 'email' );
		this.loginUser();
	};

	getLoginButtonText = () => {
		const { translate, isWoo, wccomFrom } = this.props;
		if ( this.isPasswordView() || this.isFullView() ) {
			if ( isWoo && ! wccomFrom ) {
				return translate( 'Get started' );
			}

			return translate( 'Log In' );
		}

		return translate( 'Continue' );
	};

	renderWooCommerce( { showSocialLogin = true, socialToS } = {} ) {
		const isFormDisabled = this.state.isFormDisabledWhileLoading || this.props.isFormDisabled;
		const { requestError, socialAccountIsLinking: linkingSocialUser } = this.props;

		return (
			<form method="post">
				<Card className="login__form">
					{ this.renderPrivateSiteNotice() }
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

						<FormLabel htmlFor="usernameOrEmail">
							{ this.isPasswordView() ? (
								<Button
									borderless
									className="login__form-change-username"
									onClick={ this.resetView }
								>
									<Gridicon icon="arrow-left" size={ 18 } />

									{ includes( this.state.usernameOrEmail, '@' )
										? this.props.translate( 'Change Email Address' )
										: this.props.translate( 'Change Username' ) }
								</Button>
							) : null }
						</FormLabel>

						<TextControl
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck="false"
							label={ this.props.translate( 'Email Address or Username' ) }
							disabled={ isFormDisabled || this.isPasswordView() }
							id="usernameOrEmail"
							name="usernameOrEmail"
							value={ this.state.usernameOrEmail }
							onChange={ ( value ) => {
								this.props.formUpdate();
								this.setState( {
									usernameOrEmail: value,
								} );
							} }
						/>

						{ requestError && requestError.field === 'usernameOrEmail' && (
							<FormInputValidation isError text={ requestError.message } />
						) }

						<div
							className={ classNames( 'login__form-password', {
								'is-hidden': this.isUsernameOrEmailView(),
							} ) }
						>
							<TextControl
								label={ this.props.translate( 'Password' ) }
								disabled={ isFormDisabled }
								id="password"
								name="password"
								type="password"
								value={ this.state.password }
								onChange={ ( value ) => {
									this.props.formUpdate();
									this.setState( {
										password: value,
									} );
								} }
							/>

							{ requestError && requestError.field === 'password' && (
								<FormInputValidation isError text={ requestError.message } />
							) }
						</div>
					</div>

					<div className="login__form-footer">
						<p className="login__social-tos">{ socialToS }</p>
						<div className="login__form-action">
							<Button
								primary
								disabled={ isFormDisabled }
								onClick={ this.handleWooCommerceSubmit }
								type="submit"
							>
								{ this.getLoginButtonText() }
							</Button>
						</div>

						{ config.isEnabled( 'signup/social' ) && showSocialLogin && (
							<div className="login__form-social">
								<div className="login__form-social-divider">
									<span>{ this.props.translate( 'or' ) }</span>
								</div>
								<SocialLoginForm
									linkingSocialService={
										this.props.socialAccountIsLinking ? this.props.socialAccountLinkService : null
									}
									onSuccess={ this.onWooCommerceSocialSuccess }
									socialService={ this.props.socialService }
									socialServiceResponse={ this.props.socialServiceResponse }
									uxMode={ this.shouldUseRedirectLoginFlow() ? 'redirect' : 'popup' }
								/>
							</div>
						) }
					</div>
				</Card>
			</form>
		);
	}

	renderChangeUsername() {
		return (
			<button type="button" className="login__form-change-username" onClick={ this.resetView }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ includes( this.state.usernameOrEmail, '@' )
					? this.props.translate( 'Change Email Address' )
					: this.props.translate( 'Change Username' ) }
			</button>
		);
	}

	renderUsernameorEmailLabel() {
		if ( this.props.isP2Login || ( this.props.isWoo && ! this.props.isPartnerSignup ) ) {
			return this.props.translate( 'Your email address or username' );
		}

		return this.isPasswordView()
			? this.renderChangeUsername()
			: this.props.translate( 'Email Address or Username' );
	}

	renderLostPasswordLink() {
		if ( isReactLostPasswordScreenEnabled() ) {
			return (
				<a
					className="login__form-forgot-password"
					href="/"
					onClick={ ( event ) => {
						event.preventDefault();
						this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' );
						page(
							login( {
								redirectTo: this.props.redirectTo,
								locale: this.props.locale,
								action: 'lostpassword',
								oauth2ClientId: this.props.oauth2Client && this.props.oauth2Client.id,
							} )
						);
					} }
				>
					{ this.props.translate( 'Forgot password?' ) }
				</a>
			);
		}

		return (
			<a
				className="login__form-forgot-password"
				href={ lostPassword( this.props.locale ) }
				onClick={ () => this.props.recordTracksEvent( 'calypso_login_reset_password_link_click' ) }
				rel="external"
			>
				{ this.props.translate( 'Forgot password?' ) }
			</a>
		);
	}

	render() {
		const isFormDisabled = this.state.isFormDisabledWhileLoading || this.props.isFormDisabled;

		const isSubmitButtonDisabled =
			this.props.isWoo && ! this.props.isPartnerSignup
				? this.state.usernameOrEmail.trim().length === 0 || this.state.password.trim().length === 0
				: isFormDisabled;
		const {
			accountType,
			oauth2Client,
			requestError,
			socialAccountIsLinking: linkingSocialUser,
			isJetpackWooCommerceFlow,
			isP2Login,
			isJetpackWooDnaFlow,
			wccomFrom,
			currentRoute,
			currentQuery,
			pathname,
			locale,
			showSocialLoginFormOnly,
			isWoo,
			isPartnerSignup,
		} = this.props;
		const isOauthLogin = !! oauth2Client;
		const isPasswordHidden = this.isUsernameOrEmailView();

		const signupUrl = this.props.signupUrl
			? window.location.origin + pathWithLeadingSlash( this.props.signupUrl )
			: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, pathname );

		const socialToS = this.props.translate(
			// To make any changes to this copy please speak to the legal team
			'By continuing with any of the options below, ' +
				'you agree to our {{tosLink}}Terms of Service{{/tosLink}} and' +
				' have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
			{
				components: {
					tosLink: (
						<a
							href={ localizeUrl( 'https://wordpress.com/tos/' ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					privacyLink: (
						<a
							href={ localizeUrl( 'https://automattic.com/privacy/' ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		);

		if ( showSocialLoginFormOnly ) {
			return config.isEnabled( 'signup/social' ) ? (
				<Fragment>
					<Divider>{ this.props.translate( 'or' ) }</Divider>
					<SocialLoginForm
						linkingSocialService={
							this.props.socialAccountIsLinking ? this.props.socialAccountLinkService : null
						}
						onSuccess={ this.props.onSuccess }
						socialService={ this.props.socialService }
						socialServiceResponse={ this.props.socialServiceResponse }
						uxMode={ this.shouldUseRedirectLoginFlow() ? 'redirect' : 'popup' }
						shouldRenderToS={ true }
					/>
				</Fragment>
			) : null;
		}

		if ( isJetpackWooCommerceFlow ) {
			return this.renderWooCommerce( { socialToS } );
		}

		if ( isJetpackWooDnaFlow ) {
			return this.renderWooCommerce( {
				showSocialLogin: !! accountType, // Only show the social buttons after the user entered an email.
				socialToS,
			} );
		}

		if ( isWoo && wccomFrom ) {
			return this.renderWooCommerce( { socialToS } );
		}

		return (
			<form onSubmit={ this.onSubmitForm } method="post">
				{ isCrowdsignalOAuth2Client( oauth2Client ) && (
					<p className="login__form-subheader">
						{ this.props.translate( 'Connect with your WordPress.com account:' ) }
					</p>
				) }

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
						<FormLabel htmlFor="usernameOrEmail">{ this.renderUsernameorEmailLabel() }</FormLabel>

						<FormTextInput
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck="false"
							autoComplete="username"
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

						{ requestError && requestError.field === 'usernameOrEmail' && (
							<FormInputValidation isError text={ requestError.message }>
								{ 'unknown_user' === requestError.code &&
									this.props.translate(
										' Would you like to {{newAccountLink}}create a new account{{/newAccountLink}}?',
										{
											components: {
												newAccountLink: (
													<a
														href={ addQueryArgs(
															{
																user_email: this.state.usernameOrEmail,
															},
															signupUrl
														) }
													/>
												),
											},
										}
									) }
							</FormInputValidation>
						) }

						{ isP2Login && this.isPasswordView() && this.renderChangeUsername() }

						<div
							className={ classNames( 'login__form-password', {
								'is-hidden': isPasswordHidden,
							} ) }
						>
							<FormLabel htmlFor="password">
								{ this.props.isWoo && ! this.props.isPartnerSignup
									? this.props.translate( 'Your password' )
									: this.props.translate( 'Password' ) }
							</FormLabel>

							<FormPasswordInput
								autoCapitalize="off"
								autoComplete="current-password"
								className={ classNames( {
									'is-error': requestError && requestError.field === 'password',
								} ) }
								onChange={ this.onChangeField }
								id="password"
								name="password"
								ref={ this.savePasswordRef }
								value={ this.state.password }
								disabled={ isFormDisabled }
								tabIndex={ isPasswordHidden ? -1 : undefined /* not tabbable when hidden */ }
							/>

							{ requestError && requestError.field === 'password' && (
								<FormInputValidation isError text={ requestError.message } />
							) }
						</div>
					</div>

					<p className="login__form-terms">{ socialToS }</p>
					{ this.props.isWoo && ! this.props.isPartnerSignup && this.renderLostPasswordLink() }
					<div className="login__form-action">
						<FormsButton primary disabled={ isSubmitButtonDisabled }>
							{ this.getLoginButtonText() }
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
					<Fragment>
						<Divider>{ this.props.translate( 'or' ) }</Divider>
						<SocialLoginForm
							linkingSocialService={
								this.props.socialAccountIsLinking ? this.props.socialAccountLinkService : null
							}
							onSuccess={ this.props.onSuccess }
							socialService={ this.props.socialService }
							socialServiceResponse={ this.props.socialServiceResponse }
							uxMode={ this.shouldUseRedirectLoginFlow() ? 'redirect' : 'popup' }
							shouldRenderToS={ this.props.isWoo && ! isPartnerSignup }
						/>
					</Fragment>
				) }

				{ ( currentQuery?.skip_user || currentQuery?.allow_site_connection ) && (
					<JetpackConnectSiteOnly
						homeUrl={ currentQuery?.site }
						redirectAfterAuth={ currentQuery?.redirect_after_auth }
						source="login"
					/>
				) }
			</form>
		);
	}
}

export default connect(
	( state, props ) => {
		const accountType = getAuthAccountTypeSelector( state );

		return {
			accountType,
			currentRoute: getCurrentRoute( state ),
			hasAccountTypeLoaded: accountType !== null,
			isFormDisabled: isFormDisabledSelector( state ),
			isLoggedIn: Boolean( getCurrentUserId( state ) ),
			oauth2Client: getCurrentOAuth2Client( state ),
			isJetpackWooCommerceFlow:
				'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' ),
			isJetpackWooDnaFlow: wooDnaConfig( getCurrentQueryArguments( state ) ).isWooDnaFlow(),
			isWoo: isWooOAuth2Client( getCurrentOAuth2Client( state ) ),
			isPartnerSignup: isPartnerSignupQuery( getCurrentQueryArguments( state ) ),
			redirectTo: getRedirectToOriginal( state ),
			requestError: getRequestError( state ),
			socialAccountIsLinking: getSocialAccountIsLinking( state ),
			socialAccountLinkEmail: getSocialAccountLinkEmail( state ),
			socialAccountLinkService: getSocialAccountLinkService( state ),
			userEmail:
				props.userEmail ||
				getInitialQueryArguments( state ).email_address ||
				getCurrentQueryArguments( state ).email_address,
			wccomFrom: get( getCurrentQueryArguments( state ), 'wccom-from' ),
			currentQuery: getCurrentQueryArguments( state ),
		};
	},
	{
		sendEmailLogin,
		formUpdate,
		getAuthAccountType,
		loginUser,
		recordTracksEvent,
		resetAuthAccountType,
	}
)( localize( LoginForm ) );
