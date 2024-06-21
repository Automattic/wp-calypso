import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { addLocaleToPath, localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AppPromo from 'calypso/blocks/app-promo';
import GlobalNotices from 'calypso/components/global-notices';
import JetpackHeader from 'calypso/components/jetpack-header';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import Main from 'calypso/components/main';
import {
	isGravatarOAuth2Client,
	isWPJobManagerOAuth2Client,
	isGravPoweredOAuth2Client,
	isWooOAuth2Client,
	isStudioAppOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import {
	recordTracksEventWithClientId as recordTracksEvent,
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { hideMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import { CHECK_YOUR_EMAIL_PAGE } from 'calypso/state/login/magic-login/constants';
import { getLastCheckedUsernameOrEmail } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';
import isMagicLoginEmailRequested from 'calypso/state/selectors/is-magic-login-email-requested';
import { withEnhancers } from 'calypso/state/utils';
import RequestLoginEmailForm from './request-login-email-form';

import './style.scss';

const RESEND_EMAIL_COUNTDOWN_TIME = 90; // In seconds

class MagicLogin extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,

		// mapped to dispatch
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		sendEmailLogin: PropTypes.func.isRequired,

		// mapped to state
		locale: PropTypes.string.isRequired,
		query: PropTypes.object,
		showCheckYourEmail: PropTypes.bool.isRequired,
		isSendingEmail: PropTypes.bool.isRequired,
		emailRequested: PropTypes.bool.isRequired,
		localeSuggestions: PropTypes.array,

		// From `localize`
		translate: PropTypes.func.isRequired,
	};

	state = {
		usernameOrEmail: this.props.userEmail || '',
		resendEmailCountdown: RESEND_EMAIL_COUNTDOWN_TIME,
	};

	componentDidMount() {
		this.props.recordPageView( '/log-in/link', 'Login > Link' );

		if ( isGravPoweredOAuth2Client( this.props.oauth2Client ) ) {
			this.props.recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_form', {
				client_id: this.props.oauth2Client.id,
				client_name: this.props.oauth2Client.name,
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		const { oauth2Client, emailRequested, localeSuggestions, path, showCheckYourEmail } =
			this.props;

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			if ( prevProps.isSendingEmail && emailRequested ) {
				this.startResendEmailCountdown();
			}

			if ( ! prevProps.localeSuggestions && localeSuggestions ) {
				const userLocale = localeSuggestions.find(
					( { locale } ) => locale === navigator.language.toLowerCase()
				);

				if ( userLocale ) {
					page( addLocaleToPath( path, userLocale.locale ) );
				}
			}

			if ( ! prevProps.showCheckYourEmail && showCheckYourEmail ) {
				this.props.recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_verification', {
					client_id: oauth2Client.id,
					client_name: oauth2Client.name,
				} );
			}

			if ( prevProps.showCheckYourEmail && ! showCheckYourEmail ) {
				this.props.recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_form', {
					client_id: oauth2Client.id,
					client_name: oauth2Client.name,
				} );
			}
		}
	}

	onClickEnterPasswordInstead = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_email_link_page_click_back' );

		const loginParameters = {
			isJetpack: this.props.isJetpackLogin,
			locale: this.props.locale,
			emailAddress: this.props.query?.email_address,
			signupUrl: this.props.query?.signup_url,
			usernameOnly: true,
		};

		page( login( loginParameters ) );
	};

	renderLinks() {
		const { isJetpackLogin, locale, showCheckYourEmail, translate, isWoo, query } = this.props;

		const isA4A = query?.redirect_to?.includes( 'agencies.automattic.com/client' ) ?? false;

		if ( isWoo ) {
			return null;
		}

		if ( showCheckYourEmail ) {
			if ( isA4A ) {
				return null;
			}
			return (
				<AppPromo
					title={ translate( 'Stay logged in with the Jetpack Mobile App' ) }
					campaign="calypso-login-link-check-email"
					className="magic-link-app-promo"
					iconSize={ 32 }
					hasQRCode
					hasGetAppButton={ false }
				/>
			);
		}
		if ( query?.client_id ) {
			return null;
		}

		// The email address from the URL (if present) is added to the login
		// parameters in this.onClickEnterPasswordInstead(). But it's left out
		// here deliberately, to ensure that if someone copies this link to
		// paste somewhere else, their email address isn't included in it.
		const loginParameters = {
			isJetpack: isJetpackLogin,
			locale: locale,
			signupUrl: this.props.query?.signup_url,
		};

		let linkBack = translate( 'Enter a password instead' );
		if ( query?.username_only === 'true' ) {
			linkBack = translate( 'Use username and password instead' );
		}

		return (
			<>
				<div className="magic-login__footer">
					<a href={ login( loginParameters ) } onClick={ this.onClickEnterPasswordInstead }>
						{ linkBack }
					</a>
				</div>
				{ ! isA4A && (
					<AppPromo
						title={ translate( 'Stay logged in with the Jetpack Mobile App' ) }
						campaign="calypso-login-link"
						className="magic-link-app-promo"
						iconSize={ 32 }
						hasQRCode
						hasGetAppButton={ false }
					/>
				) }
			</>
		);
	}

	renderLocaleSuggestions() {
		const { locale, path, showCheckYourEmail } = this.props;

		if ( showCheckYourEmail ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	renderGutenboardingLogo() {
		if ( this.props.isWoo ) {
			return null;
		}

		return (
			<div className="magic-login__gutenboarding-wordpress-logo">
				<svg
					aria-hidden="true"
					role="img"
					focusable="false"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 20 20"
				>
					<path d="M20 10c0-5.51-4.49-10-10-10C4.48 0 0 4.49 0 10c0 5.52 4.48 10 10 10 5.51 0 10-4.48 10-10zM7.78 15.37L4.37 6.22c.55-.02 1.17-.08 1.17-.08.5-.06.44-1.13-.06-1.11 0 0-1.45.11-2.37.11-.18 0-.37 0-.58-.01C4.12 2.69 6.87 1.11 10 1.11c2.33 0 4.45.87 6.05 2.34-.68-.11-1.65.39-1.65 1.58 0 .74.45 1.36.9 2.1.35.61.55 1.36.55 2.46 0 1.49-1.4 5-1.4 5l-3.03-8.37c.54-.02.82-.17.82-.17.5-.05.44-1.25-.06-1.22 0 0-1.44.12-2.38.12-.87 0-2.33-.12-2.33-.12-.5-.03-.56 1.2-.06 1.22l.92.08 1.26 3.41zM17.41 10c.24-.64.74-1.87.43-4.25.7 1.29 1.05 2.71 1.05 4.25 0 3.29-1.73 6.24-4.4 7.78.97-2.59 1.94-5.2 2.92-7.78zM6.1 18.09C3.12 16.65 1.11 13.53 1.11 10c0-1.3.23-2.48.72-3.59C3.25 10.3 4.67 14.2 6.1 18.09zm4.03-6.63l2.58 6.98c-.86.29-1.76.45-2.71.45-.79 0-1.57-.11-2.29-.33.81-2.38 1.62-4.74 2.42-7.1z"></path>
				</svg>
			</div>
		);
	}

	resendEmailCountdownId = null;

	resetResendEmailCountdown = () => {
		if ( ! this.resendEmailCountdownId ) {
			return;
		}

		clearInterval( this.resendEmailCountdownId );
		this.resendEmailCountdownId = null;
		this.setState( { resendEmailCountdown: RESEND_EMAIL_COUNTDOWN_TIME } );
	};

	startResendEmailCountdown = () => {
		this.resetResendEmailCountdown();

		this.resendEmailCountdownId = setInterval( () => {
			if ( ! this.state.resendEmailCountdown ) {
				clearInterval( this.resendEmailCountdownId );
				return;
			}

			this.setState( ( prevState ) => ( {
				resendEmailCountdown: prevState.resendEmailCountdown - 1,
			} ) );
		}, 1000 );
	};

	renderGravPoweredEmailVerification() {
		const {
			oauth2Client,
			translate,
			query,
			isSendingEmail,
			sendEmailLogin: resendEmail,
			hideMagicLoginRequestForm: showMagicLogin,
		} = this.props;
		const { usernameOrEmail, resendEmailCountdown } = this.state;
		const emailAddress = usernameOrEmail.includes( '@' ) ? usernameOrEmail : null;

		const emailTextOptions = {
			components: {
				sendEmailButton: (
					<button
						onClick={ () => {
							resendEmail( usernameOrEmail, {
								redirectTo: query?.redirect_to,
								requestLoginEmailFormFlow: true,
								createAccount: true,
								flow: oauth2Client.name,
								showGlobalNotices: true,
							} );

							this.props.recordTracksEvent(
								'calypso_gravatar_powered_magic_login_click_resend_email',
								{ client_id: oauth2Client.id, client_name: oauth2Client.name }
							);
						} }
						disabled={ isSendingEmail }
					/>
				),
				showMagicLoginButton: (
					<button
						className="grav-powered-magic-login__show-magic-login"
						onClick={ () => {
							this.resetResendEmailCountdown();
							showMagicLogin();

							this.props.recordTracksEvent(
								'calypso_gravatar_powered_magic_login_click_use_different_email',
								{ client_id: oauth2Client.id, client_name: oauth2Client.name }
							);
						} }
					/>
				),
			},
		};

		return (
			<>
				<div className="grav-powered-magic-login__content">
					<img src={ oauth2Client.icon } width={ 27 } height={ 27 } alt={ oauth2Client.title } />
					<h1 className="grav-powered-magic-login__header">{ translate( 'Check your email!' ) }</h1>
					<p className="grav-powered-magic-login__sub-header">
						{ emailAddress
							? translate(
									"We've sent an email with a verification link to {{strong}}%(emailAddress)s{{/strong}}",
									{
										components: { strong: <strong /> },
										args: { emailAddress },
									}
							  )
							: translate(
									'We just emailed you a link. Please check your inbox and click the link to log in.'
							  ) }
					</p>
					<hr className="grav-powered-magic-login__divider" />
					<div className="grav-powered-magic-login__footer grav-powered-magic-login__footer--email-verification">
						<div>{ translate( 'Are you having issues receiving it?' ) }</div>
						<div>
							{ resendEmailCountdown === 0
								? translate(
										'{{sendEmailButton}}Resend the verification email{{/sendEmailButton}} or {{showMagicLoginButton}}use a different email address{{/showMagicLoginButton}}.',
										emailTextOptions
								  )
								: translate(
										'{{showMagicLoginButton}}Use a different email address{{/showMagicLoginButton}}.',
										emailTextOptions
								  ) }
						</div>
					</div>
				</div>
			</>
		);
	}

	renderGravPoweredMagicLoginTos() {
		const { oauth2Client, translate } = this.props;

		const textOptions = {
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
				wpAccountLink: (
					<a
						href={ localizeUrl( 'https://support.gravatar.com/why-wordpress-com/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		};

		return (
			<div className="grav-powered-magic-login__tos">
				{ isGravatarOAuth2Client( oauth2Client )
					? translate(
							`By clicking “Send me sign in link“, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, have read our {{privacyLink}}Privacy Policy{{/privacyLink}}, and understand that you're creating {{wpAccountLink}}a WordPress.com account{{/wpAccountLink}} if you don't already have one.`,
							textOptions
					  )
					: translate(
							`By clicking “Send me sign in link“, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, have read our {{privacyLink}}Privacy Policy{{/privacyLink}}, and understand that you're creating a Gravatar account if you don't already have one.`,
							textOptions
					  ) }
			</div>
		);
	}

	renderGravPoweredMagicLogin() {
		const { oauth2Client, translate, locale, query } = this.props;

		const isGravatar = isGravatarOAuth2Client( oauth2Client );
		const loginUrl = login( {
			locale,
			redirectTo: query?.redirect_to,
			oauth2ClientId: query?.client_id,
		} );

		return (
			<>
				{ this.renderLocaleSuggestions() }
				<GlobalNotices id="notices" />
				<div className="grav-powered-magic-login__content">
					<img src={ oauth2Client.icon } width={ 27 } height={ 27 } alt={ oauth2Client.title } />
					<RequestLoginEmailForm
						flow={ oauth2Client.name }
						headerText={ translate( 'Sign in with your email' ) }
						hideSubHeaderText
						inputPlaceholder={ translate( 'Enter your email address' ) }
						submitButtonLabel={ translate( 'Send me sign in link' ) }
						tosComponent={ this.renderGravPoweredMagicLoginTos() }
						onSendEmailLogin={ ( usernameOrEmail ) => this.setState( { usernameOrEmail } ) }
						createAccountForNewUser
					/>
					<hr className="grav-powered-magic-login__divider grav-powered-magic-login__divider--email-form" />
					<div className="grav-powered-magic-login__login-page-link">
						{ translate( '{{a}}Sign in another way{{/a}}', {
							components: {
								a: (
									<a
										href={ loginUrl }
										onClick={ () =>
											this.props.recordTracksEvent(
												'calypso_gravatar_powered_magic_login_click_login_page_link',
												{ client_id: oauth2Client.id, client_name: oauth2Client.name }
											)
										}
									/>
								),
							},
						} ) }
					</div>
				</div>
				{ ! isGravatar && (
					<div className="grav-powered-magic-login__gravatar-info">
						<div className="grav-powered-magic-login__gravatar-info-heading">
							<img
								src="https://gravatar.com/images/grav-logo-blue.svg"
								width={ 18 }
								height={ 18 }
								alt="Gravatar logo"
							/>
							{ translate( 'You will be logging in via Gravatar' ) }
						</div>
						<div className="grav-powered-magic-login__gravatar-info-items">
							<div>
								<Gridicon icon="checkmark" size={ 18 } color="#646970" />
								{ translate(
									'Gravatar accounts and profiles are free. You can log in to thousands of sites across the web with one Gravatar account.'
								) }
							</div>
							<div>
								<Gridicon icon="checkmark" size={ 18 } color="#646970" />
								{ translate( 'Control what information is shared on your public profile.' ) }
							</div>
							<div>
								<Gridicon icon="checkmark" size={ 18 } color="#646970" />
								{ translate(
									"Have questions? Please see Gravatar's {{a}}documentation here{{/a}}.",
									{
										components: {
											a: <a href="https://gravatar.com/support" target="_blank" rel="noreferrer" />,
										},
									}
								) }
							</div>
						</div>
					</div>
				) }
			</>
		);
	}

	renderStudioLoginTos = () => {
		const options = {
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
		};
		const tosText = this.props.translate(
			'By creating an account you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
			options
		);

		return <p className="studio-magic-login__tos">{ tosText }</p>;
	};

	render() {
		const { oauth2Client, showCheckYourEmail, query, translate } = this.props;

		if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
			return (
				<Main
					className={ clsx( 'grav-powered-magic-login', {
						'grav-powered-magic-login--wp-job-manager': isWPJobManagerOAuth2Client( oauth2Client ),
					} ) }
				>
					{ showCheckYourEmail
						? this.renderGravPoweredEmailVerification()
						: this.renderGravPoweredMagicLogin() }
				</Main>
			);
		}

		// "query?.redirect_to" is used to determine if Studio app users are creating a new account (vs. logging in)
		if ( isStudioAppOAuth2Client( oauth2Client ) && query?.redirect_to ) {
			return (
				<Main className="magic-login magic-login__request-link is-white-login">
					{ this.renderLocaleSuggestions() }

					<GlobalNotices id="notices" />

					<RequestLoginEmailForm
						headerText={ translate( 'Sign up for WordPress.com' ) }
						tosComponent={ this.renderStudioLoginTos() }
						subHeaderText={ translate(
							'Connecting a WordPress.com account unlocks additional Studio features like demo sites.'
						) }
						customFormLabel={ translate( 'Your email address' ) }
						submitButtonLabel={ translate( 'Send activation link' ) }
						createAccountForNewUser
					/>

					{ this.renderLinks() }
				</Main>
			);
		}

		// If this is part of the Jetpack login flow and the `jetpack/magic-link-signup` feature
		// flag is enabled, some steps will display a different UI
		const requestLoginEmailFormProps = {
			...( this.props.isJetpackLogin ? { flow: 'jetpack' } : {} ),
			...( this.props.isJetpackLogin && config.isEnabled( 'jetpack/magic-link-signup' )
				? { isJetpackMagicLinkSignUpEnabled: true }
				: {} ),
			createAccountForNewUser: true,
		};

		return (
			<Main className="magic-login magic-login__request-link is-white-login">
				{ this.props.isJetpackLogin && <JetpackHeader /> }
				{ this.renderGutenboardingLogo() }

				{ this.renderLocaleSuggestions() }

				<GlobalNotices id="notices" />

				<RequestLoginEmailForm { ...requestLoginEmailFormProps } />

				{ this.renderLinks() }
			</Main>
		);
	}
}

const mapState = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	query: getCurrentQueryArguments( state ),
	showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
	isSendingEmail: isFetchingMagicLoginEmail( state ),
	emailRequested: isMagicLoginEmailRequested( state ),
	isJetpackLogin: getCurrentRoute( state ) === '/log-in/jetpack/link',
	oauth2Client: getCurrentOAuth2Client( state ),
	userEmail:
		getLastCheckedUsernameOrEmail( state ) ||
		getCurrentQueryArguments( state ).email_address ||
		getInitialQueryArguments( state ).email_address,
	localeSuggestions: getLocaleSuggestions( state ),
	isWoo: isWooOAuth2Client( getCurrentOAuth2Client( state ) ),
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	sendEmailLogin,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
	recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
