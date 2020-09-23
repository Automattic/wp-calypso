/**
 * External dependencies
 */
import classNames from 'classnames';
import { capitalize, defer, includes, get, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import config from 'config';
import FormsButton from 'components/forms/form-button';
import FormInputValidation from 'components/forms/form-input-validation';
import Divider from './divider';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'state/selectors/get-initial-query-arguments';
import getCurrentRoute from 'state/selectors/get-current-route';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getCurrentOAuth2Client } from 'state/oauth2-clients/ui/selectors';
import {
	formUpdate,
	getAuthAccountType,
	loginUser,
	resetAuthAccountType,
} from 'state/login/actions';
import { isCrowdsignalOAuth2Client, isWooOAuth2Client } from 'lib/oauth2-clients';
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
import { isRegularAccount } from 'state/login/utils';
import Notice from 'components/notice';
import SocialLoginForm from './social';
import { localizeUrl } from 'lib/i18n-utils';
import TextControl from 'extensions/woocommerce/components/text-control';
import { sendEmailLogin } from 'state/auth/actions';
import wooDnaConfig from 'jetpack-connect/woo-dna-config';

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
		isGutenboarding: PropTypes.bool,
		locale: PropTypes.string,
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

		if ( ! this.props.hasAccountTypeLoaded ) {
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
		const { isJetpackWooCommerceFlow, oauth2Client, wccomFrom } = this.props;
		if ( config.isEnabled( 'jetpack/connect/woocommerce' ) && isJetpackWooCommerceFlow ) {
			this.props.recordTracksEvent( 'wcadmin_storeprofiler_login_jetpack_account', {
				login_method: method,
			} );
		} else if (
			config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
			isWooOAuth2Client( oauth2Client ) &&
			'cart' === wccomFrom
		) {
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

	renderWooCommerce( showSocialLogin = true ) {
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

						<label htmlFor="usernameOrEmail">
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
						</label>

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
						<div className="login__form-action">
							<Button
								primary
								disabled={ isFormDisabled }
								onClick={ this.handleWooCommerceSubmit }
								type="submit"
							>
								{ this.isPasswordView() || this.isFullView()
									? this.props.translate( 'Log In' )
									: this.props.translate( 'Continue' ) }
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

	render() {
		const isFormDisabled = this.state.isFormDisabledWhileLoading || this.props.isFormDisabled;

		const {
			accountType,
			oauth2Client,
			redirectTo,
			requestError,
			socialAccountIsLinking: linkingSocialUser,
			isJetpackWooCommerceFlow,
			isGutenboarding,
			isJetpackWooDnaFlow,
			wccomFrom,
			currentRoute,
			currentQuery,
			pathname,
			locale,
		} = this.props;
		const isOauthLogin = !! oauth2Client;
		const isPasswordHidden = this.isUsernameOrEmailView();

		const langFragment = locale && locale !== 'en' ? `/${ locale }` : '';

		let signupUrl = config( 'signup_url' );
		const signupFlow = get( currentQuery, 'signup_flow' );

		// copied from login-links.jsx
		if (
			// Match locales like `/log-in/jetpack/es`
			startsWith( currentRoute, '/log-in/jetpack' )
		) {
			// Basic validation that we're in a valid Jetpack Authorization flow
			if (
				includes( get( currentQuery, 'redirect_to' ), '/jetpack/connect/authorize' ) &&
				includes( get( currentQuery, 'redirect_to' ), '_wp_nonce' )
			) {
				/**
				 * `log-in/jetpack/:locale` is reached as part of the Jetpack connection flow. In
				 * this case, the redirect_to will handle signups as part of the flow. Use the
				 * `redirect_to` parameter directly for signup.
				 */
				signupUrl = currentQuery.redirect_to;
			} else {
				signupUrl = '/jetpack/connect';
			}
		} else if ( '/jetpack-connect' === pathname ) {
			signupUrl = '/jetpack/connect';
		} else if ( signupFlow ) {
			signupUrl += '/' + signupFlow;
		}

		if ( isOauthLogin && config.isEnabled( 'signup/wpcc' ) ) {
			const oauth2Flow = isCrowdsignalOAuth2Client( oauth2Client ) ? 'crowdsignal' : 'wpcc';
			const oauth2Params = new globalThis.URLSearchParams( {
				oauth2_client_id: oauth2Client.id,
				oauth2_redirect: redirectTo || '',
			} );

			signupUrl = `/start/${ oauth2Flow }?${ oauth2Params.toString() }`;
		}

		if ( isGutenboarding ) {
			signupUrl = '/new' + langFragment;
		}

		if ( config.isEnabled( 'jetpack/connect/woocommerce' ) && isJetpackWooCommerceFlow ) {
			return this.renderWooCommerce();
		}

		if ( isJetpackWooDnaFlow ) {
			return this.renderWooCommerce( !! accountType ); // Only show the social buttons after the user entered an email.
		}

		if (
			config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
			isWooOAuth2Client( oauth2Client ) &&
			wccomFrom
		) {
			return this.renderWooCommerce();
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

						<label htmlFor="usernameOrEmail">
							{ this.isPasswordView() ? (
								<button
									type="button"
									className="login__form-change-username"
									onClick={ this.resetView }
								>
									<Gridicon icon="arrow-left" size={ 18 } />
									{ includes( this.state.usernameOrEmail, '@' )
										? this.props.translate( 'Change Email Address' )
										: this.props.translate( 'Change Username' ) }
								</button>
							) : (
								this.props.translate( 'Email Address or Username' )
							) }
						</label>

						<FormTextInput
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck="false"
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
												newAccountLink: <a href={ signupUrl } />,
											},
										}
									) }
							</FormInputValidation>
						) }

						<div
							className={ classNames( 'login__form-password', {
								'is-hidden': isPasswordHidden,
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
								tabIndex={ isPasswordHidden ? -1 : undefined /* not tabbable when hidden */ }
							/>

							{ requestError && requestError.field === 'password' && (
								<FormInputValidation isError text={ requestError.message } />
							) }
						</div>
					</div>

					{ config.isEnabled( 'signup/social' ) && (
						<p className="login__form-terms">
							{ preventWidows(
								this.props.translate(
									// To make any changes to this copy please speak to the legal team
									'By continuing, ' + 'you agree to our {{tosLink}}Terms of Service{{/tosLink}}.',
									{
										components: {
											tosLink: (
												<a
													href={ localizeUrl( 'https://wordpress.com/tos/' ) }
													target="_blank"
													rel="noopener noreferrer"
												/>
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
						/>
					</Fragment>
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
