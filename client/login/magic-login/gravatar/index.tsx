import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon, FormLabel } from '@automattic/components';
import { localizeUrl, getLanguage } from '@automattic/i18n-utils';
import { useRef, useState, useEffect } from '@wordpress/element';
import clsx from 'clsx';
import emailValidator from 'email-validator';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import FormButton from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import GlobalNotices from 'calypso/components/global-notices';
import GravatarLoginLogo from 'calypso/components/gravatar-login-logo';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import getGravatarOAuth2Flow from 'calypso/lib/get-gravatar-oauth2-flow';
import {
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
	isWPJobManagerOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { rebootAfterLogin } from 'calypso/state/login/actions';
import {
	hideMagicLoginRequestForm,
	fetchMagicLoginAuthenticate,
} from 'calypso/state/login/magic-login/actions';
import { CHECK_YOUR_EMAIL_PAGE } from 'calypso/state/login/magic-login/constants';
import {
	getLastCheckedUsernameOrEmail,
	getTwoFactorNotificationSent,
	getRedirectToSanitized,
	isTwoFactorEnabled,
} from 'calypso/state/login/selectors';
import {
	infoNotice,
	errorNotice,
	successNotice,
	removeNotice,
} from 'calypso/state/notices/actions';
import {
	getCurrentOAuth2Client,
	getCurrentOAuth2ClientId,
} from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';
import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';
import { MagicLoginLocaleSuggestions } from '../index';
import RequestLoginEmailForm from '../request-login-email-form';
import './style.scss';

const RESEND_EMAIL_COUNTDOWN_TIME = 90; // In seconds
const GRAVATAR_FROM_3RD_PARTY = '3rd-party';
const GRAVATAR_FROM_QUICK_EDITOR = 'quick-editor';

const GravPoweredMagicLoginTos = () => {
	const translate = useTranslate();
	const oauth2Client = useSelector( getCurrentOAuth2Client );

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
						"By clicking “Continue“, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, have read our {{privacyLink}}Privacy Policy{{/privacyLink}}, and understand that you're creating {{wpAccountLink}}a WordPress.com account{{/wpAccountLink}} if you don't already have one.",
						textOptions
				  )
				: translate(
						"By clicking “Send me sign in link“, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, have read our {{privacyLink}}Privacy Policy{{/privacyLink}}, and understand that you're creating a Gravatar account if you don't already have one.",
						textOptions
				  ) }
		</div>
	);
};

const emailToSha256 = async ( email: string ) => {
	if ( ! window.crypto?.subtle ) {
		return null;
	}

	const data = new TextEncoder().encode( email );
	const hashBuffer = await crypto.subtle.digest( 'SHA-256', data );

	return Array.from( new Uint8Array( hashBuffer ) )
		.map( ( byte ) => byte.toString( 16 ).padStart( 2, '0' ) )
		.join( '' );
};

interface GravPoweredEmailFormProps {
	path: string;
	oauth2Client: any;
	oauth2ClientId: string | number | null;
	locale: string;
	currentQueryArguments: Record< string, string > | undefined;
	isGravatar: boolean;
	isGravatarFlow: boolean;
	isWPJobManager: boolean;
	isFromGravatar3rdPartyApp: boolean;
	isFromGravatarQuickEditor: boolean;
	isGravatarFlowWithEmail: boolean;
	showCheckYourEmail: boolean;
	isRequestingEmail: boolean;
	requestEmailErrorMessage: string | null;
	handleGravPoweredEmailSubmit: (
		usernameOrEmail: string,
		e: React.FormEvent< HTMLFormElement >
	) => Promise< void >;
	setUsernameOrEmail: ( email: string ) => void;
	setRequestEmailErrorMessage: ( message: string | null ) => void;
	recordTracksEvent: ( eventName: string, properties?: Record< string, any > ) => void;
}

const GravPoweredEmailForm = ( {
	path,
	oauth2Client,
	oauth2ClientId,
	locale,
	currentQueryArguments,
	isGravatar,
	isGravatarFlow,
	isWPJobManager,
	isFromGravatar3rdPartyApp,
	isFromGravatarQuickEditor,
	isGravatarFlowWithEmail,
	showCheckYourEmail,
	isRequestingEmail,
	requestEmailErrorMessage,
	handleGravPoweredEmailSubmit,
	setUsernameOrEmail,
	setRequestEmailErrorMessage,
	recordTracksEvent,
}: GravPoweredEmailFormProps ) => {
	const translate = useTranslate();

	const isFromGravatarSignup = isGravatar && currentQueryArguments?.gravatar_from === 'signup';
	const isEmailInputDisabled =
		isFromGravatar3rdPartyApp ||
		isFromGravatarQuickEditor ||
		isRequestingEmail ||
		isGravatarFlowWithEmail;

	let headerText = isFromGravatarSignup
		? translate( 'Create your Gravatar' )
		: translate( 'Edit your Gravatar' );
	headerText = isWPJobManager ? translate( 'Sign in with your email' ) : headerText;

	let subHeader: TranslateResult = '';
	if ( isGravatarFlow ) {
		subHeader = translate( '%(clientTitle)s profiles are powered by Gravatar.', {
			args: { clientTitle: oauth2Client?.title ?? '' },
		} );
	} else if ( isFromGravatar3rdPartyApp || isFromGravatarQuickEditor ) {
		subHeader = translate( 'Profiles and avatars are powered by Gravatar.' );
	}

	const submitButtonLabel = isGravatar
		? translate( 'Continue' )
		: translate( 'Send me sign in link' );

	const loginUrl = login( {
		locale,
		redirectTo: currentQueryArguments?.redirect_to,
		oauth2ClientId: oauth2ClientId as number,
		gravatarFrom: currentQueryArguments?.gravatar_from,
		gravatarFlow: isGravatarFlow,
		emailAddress: currentQueryArguments?.email_address,
	} );

	return (
		<>
			<MagicLoginLocaleSuggestions path={ path } showCheckYourEmail={ showCheckYourEmail } />
			<GlobalNotices id="notices" />
			<div className="grav-powered-magic-login__content">
				<GravatarLoginLogo
					iconUrl={ oauth2Client?.icon }
					alt={ oauth2Client?.title ?? '' }
					isCoBrand={ isGravatarFlow }
				/>
				<RequestLoginEmailForm
					flow={ oauth2Client ? getGravatarOAuth2Flow( oauth2Client ) : undefined }
					headerText={ headerText }
					subHeaderText={ subHeader }
					inputPlaceholder={ translate( 'Enter your email address' ) }
					submitButtonLabel={ submitButtonLabel }
					tosComponent={ ! isGravatar && <GravPoweredMagicLoginTos /> }
					onSubmitEmail={ isGravatar ? handleGravPoweredEmailSubmit : undefined }
					onSendEmailLogin={ ( _usernameOrEmail: string ) =>
						setUsernameOrEmail( _usernameOrEmail )
					}
					createAccountForNewUser
					errorMessage={ requestEmailErrorMessage }
					onErrorDismiss={ () => setRequestEmailErrorMessage( null ) }
					isEmailInputDisabled={ isEmailInputDisabled }
					isEmailInputError={ !! requestEmailErrorMessage }
					isSubmitButtonDisabled={ isRequestingEmail || !! requestEmailErrorMessage }
					isSubmitButtonBusy={ isRequestingEmail }
				/>
				{ isGravatar && (
					<div className="grav-powered-magic-login__feature-items">
						<div className="grav-powered-magic-login__feature-item">
							<svg
								className="grav-powered-magic-login__feature-icon"
								width="40"
								height="41"
								viewBox="0 0 40 41"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle
									cx="20"
									cy="20.5"
									r="19.25"
									fill="white"
									stroke="#1D4FC4"
									strokeWidth="1.5"
								/>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M24 17.5C24 19.7091 22.2091 21.5 20 21.5C17.7909 21.5 16 19.7091 16 17.5C16 15.2909 17.7909 13.5 20 13.5C22.2091 13.5 24 15.2909 24 17.5ZM22.5 17.5C22.5 18.8807 21.3807 20 20 20C18.6193 20 17.5 18.8807 17.5 17.5C17.5 16.1193 18.6193 15 20 15C21.3807 15 22.5 16.1193 22.5 17.5Z"
									fill="#1D4FC4"
								/>
								<path
									d="M26.75 28.5V26.5C26.75 24.9812 25.5188 23.75 24 23.75L16 23.75C14.4812 23.75 13.25 24.9812 13.25 26.5V28.5H14.75L14.75 26.5C14.75 25.8096 15.3096 25.25 16 25.25L24 25.25C24.6904 25.25 25.25 25.8096 25.25 26.5V28.5H26.75Z"
									fill="#1D4FC4"
								/>
							</svg>
							<div>
								<h4 className="grav-powered-magic-login__feature-header">
									{ translate( 'One profile, everywhere' ) }
								</h4>
								<p className="grav-powered-magic-login__feature-sub-header">
									{ translate( 'Your avatar and bio syncs across the web.' ) }
								</p>
							</div>
						</div>
						<div className="grav-powered-magic-login__feature-item">
							<svg
								className="grav-powered-magic-login__feature-icon"
								width="40"
								height="41"
								viewBox="0 0 40 41"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle
									cx="20"
									cy="20.5"
									r="19.25"
									fill="white"
									stroke="#1D4FC4"
									strokeWidth="1.5"
								/>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M20 11.75C17.9289 11.75 16.25 13.4289 16.25 15.5V18.5H15C14.4477 18.5 14 18.9477 14 19.5V27.5C14 28.0523 14.4477 28.5 15 28.5H25C25.5523 28.5 26 28.0523 26 27.5V19.5C26 18.9477 25.5523 18.5 25 18.5H23.75V15.5C23.75 13.4289 22.0711 11.75 20 11.75ZM22.25 18.5V15.5C22.25 14.2574 21.2426 13.25 20 13.25C18.7574 13.25 17.75 14.2574 17.75 15.5V18.5H22.25ZM15.5 27V20H24.5V27H15.5Z"
									fill="#1D4FC4"
								/>
							</svg>
							<div>
								<h4 className="grav-powered-magic-login__feature-header">
									{ translate( 'Public, open, and responsible' ) }
								</h4>
								<p className="grav-powered-magic-login__feature-sub-header">
									{ translate( 'Full control over your data and privacy.' ) }
								</p>
							</div>
						</div>
						<div className="grav-powered-magic-login__feature-item">
							<svg
								className="grav-powered-magic-login__feature-icon"
								width="40"
								height="41"
								viewBox="0 0 40 41"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle
									cx="20"
									cy="20.5"
									r="19.25"
									fill="white"
									stroke="#1D4FC4"
									strokeWidth="1.5"
								/>
								<path
									d="M19 21.5V26.5H20.5V21.5H25.5V20H20.5V15H19V20H14V21.5H19Z"
									fill="#1D4FC4"
								/>
							</svg>
							<div>
								<h4 className="grav-powered-magic-login__feature-header">
									{ translate( '200+ million users' ) }
								</h4>
								<p className="grav-powered-magic-login__feature-sub-header">
									{ translate( 'Used by WordPress, Slack, and many more.' ) }
								</p>
							</div>
						</div>
					</div>
				) }
				{ isWPJobManager && (
					<hr className="grav-powered-magic-login__divider grav-powered-magic-login__divider--email-form" />
				) }
				{ ! isFromGravatarSignup && (
					<footer className="grav-powered-magic-login__footer grav-powered-magic-login__footer--email-form">
						{ translate( '{{a}}Sign in another way{{/a}}', {
							components: {
								a: (
									<a
										href="/"
										onClick={ ( e ) => {
											e.preventDefault();
											recordTracksEvent(
												'calypso_gravatar_powered_magic_login_click_login_page_link',
												{ client_id: oauth2ClientId, client_name: oauth2Client?.title }
											);
											page( loginUrl );
										} }
									/>
								),
							},
						} ) }
					</footer>
				) }
			</div>
			{ isWPJobManager && (
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
							{ translate( "Have questions? Please see Gravatar's {{a}}documentation here{{/a}}.", {
								components: {
									a: <a href="https://gravatar.com/support" target="_blank" rel="noreferrer" />,
								},
							} ) }
						</div>
					</div>
				</div>
			) }
		</>
	);
};

interface GravPoweredSecondaryEmailOptionsProps {
	oauth2Client: any;
	oauth2ClientId: string | number | null;
	isGravatarFlow: boolean;
	usernameOrEmail: string;
	maskedEmailAddress: string;
	isNewAccount: boolean;
	setIsNewAccount: ( value: boolean ) => void;
	isRequestingEmail: boolean;
	requestEmailErrorMessage: string | null;
	setRequestEmailErrorMessage: ( msg: string | null ) => void;
	shouldShowSwitchEmail: boolean;
	handleGravPoweredEmailSwitch: () => void;
	handleGravPoweredEmailCodeSend: ( email: string, cb?: () => void ) => void;
	setShowSecondaryEmailOptions: ( value: boolean ) => void;
	recordTracksEvent: ( eventName: string, properties?: Record< string, any > ) => void;
}

const GravPoweredSecondaryEmailOptions = ( {
	oauth2Client,
	oauth2ClientId,
	isGravatarFlow,
	usernameOrEmail,
	maskedEmailAddress,
	isNewAccount,
	setIsNewAccount,
	isRequestingEmail,
	requestEmailErrorMessage,
	setRequestEmailErrorMessage,
	shouldShowSwitchEmail,
	handleGravPoweredEmailSwitch,
	handleGravPoweredEmailCodeSend,
	setShowSecondaryEmailOptions,
	recordTracksEvent,
}: GravPoweredSecondaryEmailOptionsProps ) => {
	const translate = useTranslate();
	const [ hashedEmail, setHashedEmail ] = useState< string | null >( null );

	useEffect( () => {
		if ( usernameOrEmail ) {
			emailToSha256( usernameOrEmail ).then( setHashedEmail );
		}
	}, [ usernameOrEmail ] );

	const eventOptions = { client_id: oauth2ClientId, client_name: oauth2Client?.title };

	return (
		<div className="grav-powered-magic-login__content">
			<GravatarLoginLogo
				iconUrl={ oauth2Client?.icon }
				alt={ oauth2Client?.title ?? '' }
				isCoBrand={ isGravatarFlow }
			/>
			<h1 className="grav-powered-magic-login__header">{ translate( 'Important note' ) }</h1>
			<p className="grav-powered-magic-login__sub-header">
				{ translate(
					'The submitted email is already linked to an existing Gravatar account as a secondary email:'
				) }
			</p>
			<div className="grav-powered-magic-login__account-info">
				<div className="grav-powered-magic-login__masked-email-address">
					{ translate( 'Account: {{strong}}%(maskedEmailAddress)s{{/strong}}', {
						components: { strong: <strong /> },
						args: { maskedEmailAddress },
					} ) }
				</div>
				{ hashedEmail && (
					<a href={ `https://gravatar.com/${ hashedEmail }` } target="_blank" rel="noreferrer">
						{ translate( 'Open profile' ) }
					</a>
				) }
			</div>
			<div className="grav-powered-magic-login__account-options">
				<button
					className={ clsx( 'grav-powered-magic-login__account-option', {
						'grav-powered-magic-login__account-option--selected': ! isNewAccount,
					} ) }
					onClick={ () => {
						setIsNewAccount( false );
						recordTracksEvent(
							'calypso_gravatar_powered_magic_login_click_main_account',
							eventOptions
						);
					} }
					disabled={ isRequestingEmail }
				>
					{ translate( 'Log in with main account (recommended)' ) }
				</button>
				{ ! isNewAccount && (
					<div>
						{ translate(
							'Log in with your main account and edit there your avatar for your secondary email address.'
						) }
					</div>
				) }
				<button
					className={ clsx( 'grav-powered-magic-login__account-option', {
						'grav-powered-magic-login__account-option--selected': isNewAccount,
					} ) }
					onClick={ () => {
						setIsNewAccount( true );
						recordTracksEvent(
							'calypso_gravatar_powered_magic_login_click_new_account',
							eventOptions
						);
					} }
					disabled={ isRequestingEmail }
				>
					{ translate( 'Create a new account' ) }
				</button>
				{ isNewAccount && (
					<div>
						{ translate(
							'If you continue a new account will be created, and {{strong}}%(emailAddress)s{{/strong}} will be disconnected from the current main account.',
							{
								components: { strong: <strong /> },
								args: { emailAddress: usernameOrEmail },
							}
						) }
					</div>
				) }
			</div>
			{ requestEmailErrorMessage && (
				<Notice
					duration={ 10000 }
					text={ requestEmailErrorMessage }
					className="magic-login__request-login-email-form-notice"
					showDismiss={ false }
					onDismissClick={ () => setRequestEmailErrorMessage( null ) }
					status="is-transparent-info"
				/>
			) }
			<FormButton
				onClick={ () =>
					handleGravPoweredEmailCodeSend( usernameOrEmail, () =>
						setShowSecondaryEmailOptions( false )
					)
				}
				disabled={ isRequestingEmail || !! requestEmailErrorMessage }
				busy={ isRequestingEmail }
			>
				{ translate( 'Continue' ) }
			</FormButton>
			<footer className="grav-powered-magic-login__footer">
				{ shouldShowSwitchEmail && (
					<button onClick={ handleGravPoweredEmailSwitch }>{ translate( 'Switch email' ) }</button>
				) }
				<a href="https://gravatar.com/support" target="_blank" rel="noreferrer">
					{ translate( 'Need help logging in?' ) }
				</a>
			</footer>
		</div>
	);
};

interface GravPoweredEmailCodeVerificationProps {
	locale: string;
	oauth2Client: any;
	oauth2ClientId: string | number | null;
	isGravatarFlow: boolean;
	isFromGravatar3rdPartyApp: boolean;
	usernameOrEmail: string;
	maskedEmailAddress: string;
	isSecondaryEmail: boolean;
	isNewAccount: boolean;
	verificationCodeInputValue: string;
	handleGravPoweredCodeInputChange: ( e: React.ChangeEvent< HTMLInputElement > ) => void;
	handleGravPoweredCodeSubmit: ( e: React.FormEvent< HTMLFormElement > ) => void;
	handleGravPoweredEmailCodeSend: ( email: string ) => void;
	resendEmailCountdown: number;
	isRequestingEmail: boolean;
	shouldShowSwitchEmail: boolean;
	resetResendEmailCountdown: () => void;
	handleGravPoweredEmailSwitch: () => void;
	recordTracksEvent: ( eventName: string, properties?: Record< string, any > ) => void;
}

const GravPoweredEmailCodeVerification = ( {
	locale,
	oauth2Client,
	oauth2ClientId,
	isGravatarFlow,
	isFromGravatar3rdPartyApp,
	usernameOrEmail,
	maskedEmailAddress,
	isSecondaryEmail,
	isNewAccount,
	verificationCodeInputValue,
	handleGravPoweredCodeInputChange,
	handleGravPoweredCodeSubmit,
	handleGravPoweredEmailCodeSend,
	resendEmailCountdown,
	isRequestingEmail,
	shouldShowSwitchEmail,
	resetResendEmailCountdown,
	handleGravPoweredEmailSwitch,
	recordTracksEvent,
}: GravPoweredEmailCodeVerificationProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isValidatingCode = useSelector( isFetchingMagicLoginAuth );
	const isCodeValidated = useSelector( getMagicLoginRequestedAuthSuccessfully );
	const codeValidationError = useSelector( getMagicLoginRequestAuthError );
	const twoFactorEnabled = useSelector( isTwoFactorEnabled );
	const twoFactorNotificationSent = useSelector( getTwoFactorNotificationSent );
	const redirectToSanitized = useSelector( getRedirectToSanitized );
	const isProcessingCode = isValidatingCode || isCodeValidated;

	useEffect( () => {
		if ( ! isCodeValidated ) {
			return;
		}

		if ( ! twoFactorEnabled ) {
			dispatch( rebootAfterLogin( { magic_login: 1 } ) );
		} else {
			page(
				login( {
					// If no notification is sent, the user is using the authenticator for 2FA by default.
					twoFactorAuthType: twoFactorNotificationSent?.replace( 'none', 'authenticator' ) ?? '',
					redirectTo: redirectToSanitized ?? '',
					oauth2ClientId: oauth2Client.id,
					locale,
				} )
			);
		}
	}, [
		isCodeValidated,
		twoFactorEnabled,
		twoFactorNotificationSent,
		redirectToSanitized,
		oauth2Client,
		locale,
		dispatch,
	] );

	let errorText = translate( 'Something went wrong. Please try again.' );

	if ( codeValidationError?.type === 'sms_code_throttled' ) {
		errorText = translate(
			'Your two-factor code via SMS can only be requested once per minute. Please wait, then request a new code via email to proceed.'
		);
	} else if ( codeValidationError?.type === 'user_email' ) {
		errorText = translate(
			"We're sorry, you can't create a new account at this time. Please try a different email address or disable any VPN before trying again."
		);
	} else if ( codeValidationError?.code === 403 ) {
		errorText = translate(
			'Invalid code. If the error persists, please request a new code and try again.'
		);
	} else if ( codeValidationError?.code === 429 ) {
		errorText = translate( 'Please wait a minute before trying again.' );
	}

	return (
		<div className="grav-powered-magic-login__content">
			<GravatarLoginLogo
				iconUrl={ oauth2Client?.icon }
				alt={ oauth2Client?.title ?? '' }
				isCoBrand={ isGravatarFlow }
			/>
			<h1 className="grav-powered-magic-login__header">{ translate( 'Check your email' ) }</h1>
			<p className="grav-powered-magic-login__sub-header">
				<span>
					{ translate(
						'Enter the verification code we’ve sent to {{strong}}%(emailAddress)s{{/strong}}.',
						{
							components: { strong: <strong /> },
							args: {
								emailAddress:
									isSecondaryEmail && ! isNewAccount ? maskedEmailAddress : usernameOrEmail,
							},
						}
					) }
				</span>
				{ isSecondaryEmail && isNewAccount && (
					<span>{ translate( ' A new Gravatar account will be created.' ) }</span>
				) }
				{ isSecondaryEmail && ! isNewAccount && (
					<span>{ translate( ' This email already exists and is synced with Gravatar.' ) }</span>
				) }
			</p>
			{ isNewAccount && <GravPoweredMagicLoginTos /> }
			<form
				className="grav-powered-magic-login__verification-code-form"
				onSubmit={ handleGravPoweredCodeSubmit }
			>
				<FormLabel htmlFor="verification-code" hidden>
					{ translate( 'Enter the verification code' ) }
				</FormLabel>
				<FormTextInput
					id="verification-code"
					value={ verificationCodeInputValue }
					onChange={ handleGravPoweredCodeInputChange }
					placeholder={ translate( 'Verification code' ) }
					disabled={ isProcessingCode }
					isError={ !! codeValidationError }
					autoFocus // eslint-disable-line jsx-a11y/no-autofocus
				/>
				{ codeValidationError && (
					<Notice
						text={ errorText }
						className="magic-login__request-login-email-form-notice"
						showDismiss={ false }
						status="is-transparent-info"
					/>
				) }
				<FormButton
					primary
					disabled={
						! verificationCodeInputValue ||
						verificationCodeInputValue.length < 6 ||
						isProcessingCode
					}
					busy={ isProcessingCode }
				>
					{ translate( 'Continue' ) }
				</FormButton>
			</form>
			<footer
				className={ clsx( 'grav-powered-magic-login__footer', {
					'grav-powered-magic-login__footer--vertical': ! isFromGravatar3rdPartyApp,
				} ) }
			>
				<button
					onClick={ () => {
						handleGravPoweredEmailCodeSend( usernameOrEmail );
						recordTracksEvent( 'calypso_gravatar_powered_magic_login_click_resend_email', {
							type: 'code',
							client_id: oauth2ClientId,
							client_name: oauth2Client?.title,
						} );
					} }
					disabled={ Boolean( isRequestingEmail ) || Boolean( resendEmailCountdown ) }
				>
					{ resendEmailCountdown === 0
						? translate( 'Send again' )
						: translate( 'Send again (%(countdown)d)', {
								args: { countdown: resendEmailCountdown },
						  } ) }
				</button>
				{ shouldShowSwitchEmail && (
					<button
						onClick={ () => {
							resetResendEmailCountdown();
							handleGravPoweredEmailSwitch();
						} }
					>
						{ translate( 'Switch email' ) }
					</button>
				) }
				<a href="https://gravatar.com/support" target="_blank" rel="noreferrer">
					{ translate( 'Need help logging in?' ) }
				</a>
			</footer>
		</div>
	);
};

interface GravPoweredEmailLinkVerificationProps {
	oauth2Client: any;
	oauth2ClientId: string | number | null;
	isGravatarFlow: boolean;
	usernameOrEmail: string;
	currentQueryArguments: Record< string, string > | undefined;
	resendEmailCountdown: number;
	resetResendEmailCountdown: () => void;
	handleGravPoweredEmailSwitch: () => void;
	recordTracksEvent: ( eventName: string, properties?: Record< string, any > ) => void;
}

const GravPoweredEmailLinkVerification = ( {
	oauth2Client,
	oauth2ClientId,
	isGravatarFlow,
	usernameOrEmail,
	currentQueryArguments,
	resendEmailCountdown,
	resetResendEmailCountdown,
	handleGravPoweredEmailSwitch,
	recordTracksEvent,
}: GravPoweredEmailLinkVerificationProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const emailAddress = usernameOrEmail.includes( '@' ) ? usernameOrEmail : null;
	const isSendingEmail = useSelector( isFetchingMagicLoginEmail );

	const emailTextOptions = {
		components: {
			sendEmailButton: (
				<button
					onClick={ () => {
						dispatch(
							sendEmailLogin( usernameOrEmail, {
								redirectTo: currentQueryArguments?.redirect_to ?? '',
								requestLoginEmailFormFlow: true,
								createAccount: true,
								flow: oauth2Client ? getGravatarOAuth2Flow( oauth2Client ) ?? '' : '',
								showGlobalNotices: true,
								tokenType: 'link',
								source: false,
								blogId: '',
								loginFormFlow: false,
								isMobileAppLogin: false,
							} )
						);

						recordTracksEvent( 'calypso_gravatar_powered_magic_login_click_resend_email', {
							type: 'link',
							client_id: oauth2ClientId,
							client_name: oauth2Client?.title,
						} );
					} }
					disabled={ isSendingEmail }
				/>
			),
			showMagicLoginButton: (
				<button
					className="grav-powered-magic-login__show-magic-login"
					onClick={ () => {
						resetResendEmailCountdown();
						handleGravPoweredEmailSwitch();
					} }
				/>
			),
		},
	};

	return (
		<div className="grav-powered-magic-login__content">
			<GravatarLoginLogo
				iconUrl={ oauth2Client?.icon }
				alt={ oauth2Client?.title ?? '' }
				isCoBrand={ isGravatarFlow }
			/>
			<h1 className="grav-powered-magic-login__header">{ translate( 'Check your email!' ) }</h1>
			<p className="grav-powered-magic-login__sub-header">
				{ emailAddress
					? translate(
							"We've sent an email with a verification link to {{strong}}%(emailAddress)s{{/strong}}",
							{ components: { strong: <strong /> }, args: { emailAddress } }
					  )
					: translate(
							'We just emailed you a link. Please check your inbox and click the link to log in.'
					  ) }
			</p>
			<hr className="grav-powered-magic-login__divider" />
			<div className="grav-powered-magic-login__footer">
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
	);
};

const GravPoweredMagicLogin = ( { path }: { path: string } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const locale = useSelector( getCurrentLocaleSlug );
	const lastCheckedUsernameOrEmail = useSelector( getLastCheckedUsernameOrEmail ) as string | null;
	const currentQueryArguments = useSelector( getCurrentQueryArguments ) as
		| Record< string, string >
		| undefined;
	const initialQueryArguments = useSelector( getInitialQueryArguments );
	const userEmail =
		lastCheckedUsernameOrEmail ||
		currentQueryArguments?.email_address ||
		initialQueryArguments?.email_address;
	const [ isRequestingEmail, setIsRequestingEmail ] = useState( false );
	const [ requestEmailErrorMessage, setRequestEmailErrorMessage ] = useState< string | null >(
		null
	);
	const [ isSecondaryEmail, setIsSecondaryEmail ] = useState( false );
	const [ maskedEmailAddress, setMaskedEmailAddress ] = useState( '' );
	const [ usernameOrEmail, setUsernameOrEmail ] = useState( userEmail || '' );
	const [ showSecondaryEmailOptions, setShowSecondaryEmailOptions ] = useState( false );
	const [ showEmailCodeVerification, setShowEmailCodeVerification ] = useState( false );
	const [ verificationCodeInputValue, setVerificationCodeInputValue ] = useState( '' );
	const [ publicToken, setPublicToken ] = useState< string | null >( null );
	const [ isNewAccount, setIsNewAccount ] = useState( false );
	const showCheckYourEmail = useSelector( getMagicLoginCurrentView ) === CHECK_YOUR_EMAIL_PAGE;
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const oauth2ClientId = useSelector( getCurrentOAuth2ClientId );
	const isGravatar = isGravatarOAuth2Client( oauth2Client );
	const isGravatarFlow = isGravatarFlowOAuth2Client( oauth2Client );
	const isGravatarFlowWithEmail = !! ( isGravatarFlow && currentQueryArguments?.email_address );
	const isWPJobManager = isWPJobManagerOAuth2Client( oauth2Client );
	const isFromGravatar3rdPartyApp =
		isGravatar && currentQueryArguments?.gravatar_from === GRAVATAR_FROM_3RD_PARTY;
	const isFromGravatarQuickEditor =
		isGravatar && currentQueryArguments?.gravatar_from === GRAVATAR_FROM_QUICK_EDITOR;
	const shouldShowSwitchEmail =
		! isFromGravatar3rdPartyApp && ! isFromGravatarQuickEditor && ! isGravatarFlowWithEmail;

	const hasSubHeader =
		isGravatarFlowOAuth2Client( oauth2Client ) ||
		( isGravatarOAuth2Client( oauth2Client ) &&
			( currentQueryArguments?.gravatar_from === GRAVATAR_FROM_3RD_PARTY ||
				currentQueryArguments?.gravatar_from === GRAVATAR_FROM_QUICK_EDITOR ) );

	useEffect( () => {
		recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_form', {
			client_id: oauth2ClientId,
			client_name: oauth2Client?.title,
			from: currentQueryArguments?.gravatar_from,
			is_gravatar_flow: isGravatarFlow,
			is_gravatar_flow_with_email: Boolean(
				isGravatarFlow && currentQueryArguments?.email_address
			),
			is_initial_view: true,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Track previous values for analytics event logic
	const prevShowCheckYourEmail = useRef( showCheckYourEmail );
	const prevShowEmailCodeVerification = useRef( showEmailCodeVerification );
	const prevShowSecondaryEmailOptions = useRef( showSecondaryEmailOptions );
	useEffect( () => {
		const eventOptions = { client_id: oauth2ClientId, client_name: oauth2Client?.title };

		if (
			( prevShowCheckYourEmail.current && ! showCheckYourEmail ) ||
			( prevShowEmailCodeVerification.current && ! showEmailCodeVerification ) ||
			( prevShowSecondaryEmailOptions.current && ! showSecondaryEmailOptions )
		) {
			recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_form', {
				...eventOptions,
				from: currentQueryArguments?.gravatar_from,
				is_gravatar_flow: isGravatarFlow,
				is_gravatar_flow_with_email: Boolean(
					isGravatarFlow && currentQueryArguments?.email_address
				),
				is_initial_view: false,
			} );
		}

		if ( ! prevShowSecondaryEmailOptions.current && showSecondaryEmailOptions ) {
			recordTracksEvent(
				'calypso_gravatar_powered_magic_login_secondary_email_options',
				eventOptions
			);
			recordTracksEvent( 'calypso_gravatar_powered_magic_login_click_main_account', eventOptions );
		}

		if ( ! prevShowEmailCodeVerification.current && showEmailCodeVerification ) {
			recordTracksEvent(
				'calypso_gravatar_powered_magic_login_email_code_verification',
				eventOptions
			);
		}

		if ( ! prevShowCheckYourEmail.current && showCheckYourEmail ) {
			recordTracksEvent(
				'calypso_gravatar_powered_magic_login_email_link_verification',
				eventOptions
			);
		}

		// Update refs for next render
		prevShowCheckYourEmail.current = showCheckYourEmail;
		prevShowEmailCodeVerification.current = showEmailCodeVerification;
		prevShowSecondaryEmailOptions.current = showSecondaryEmailOptions;
	}, [
		showCheckYourEmail,
		showEmailCodeVerification,
		showSecondaryEmailOptions,
		oauth2ClientId,
		oauth2Client?.title,
		isGravatarFlow,
		currentQueryArguments?.gravatar_from,
		currentQueryArguments?.email_address,
	] );

	const resendEmailCountdownId = useRef< NodeJS.Timeout | null >( null );
	const [ resendEmailCountdown, setResendEmailCountdown ] = useState( RESEND_EMAIL_COUNTDOWN_TIME );

	const resetResendEmailCountdown = () => {
		if ( resendEmailCountdownId.current ) {
			clearInterval( resendEmailCountdownId.current );
			resendEmailCountdownId.current = null;
		}

		setResendEmailCountdown( RESEND_EMAIL_COUNTDOWN_TIME );
	};

	const startResendEmailCountdown = () => {
		resetResendEmailCountdown();

		resendEmailCountdownId.current = setInterval( () => {
			setResendEmailCountdown( ( prev ) => {
				if ( prev <= 1 ) {
					if ( resendEmailCountdownId.current ) {
						clearInterval( resendEmailCountdownId.current );
						resendEmailCountdownId.current = null;
					}
					return 0;
				}
				return prev - 1;
			} );
		}, 1000 );
	};

	// Ensure interval is cleared on unmount
	useEffect( () => {
		return () => {
			if ( resendEmailCountdownId.current ) {
				clearInterval( resendEmailCountdownId.current );
			}
		};
	}, [] );

	const handleGravPoweredEmailCodeSend = async ( email: string, cb = () => {} ) => {
		const noticeId = 'email-code-notice';
		const duration = 4000;
		const eventOptions = { client_id: oauth2ClientId, client_name: oauth2Client?.title };

		setIsRequestingEmail( true );

		try {
			infoNotice( translate( 'Sending email…' ), { id: noticeId, duration } );

			recordTracksEvent(
				'calypso_gravatar_powered_magic_login_email_code_requesting',
				eventOptions
			);

			const { public_token } = await wpcom.req.post(
				'/auth/send-login-email',
				{ apiVersion: '1.3' },
				{
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					locale,
					lang_id: getLanguage( locale )?.value,
					email: email,
					redirect_to: currentQueryArguments?.redirect_to,
					flow: oauth2Client ? getGravatarOAuth2Flow( oauth2Client ) : undefined,
					create_account: true,
					tos: getToSAcceptancePayload(),
					token_type: 'code',
					...( isSecondaryEmail ? { gravatar_main: ! isNewAccount } : {} ),
				}
			);

			setPublicToken( public_token );
			setShowEmailCodeVerification( true );
			startResendEmailCountdown();
			cb();

			dispatch( removeNotice( noticeId ) );
			dispatch( successNotice( translate( 'Email Sent. Check your mail app!' ), { duration } ) );

			recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_code_success', eventOptions );
		} catch ( error ) {
			const err = error as { error?: string; status?: number; message?: string };
			if ( err?.error ) {
				setRequestEmailErrorMessage( err?.message ?? null );
			} else {
				setRequestEmailErrorMessage( translate( 'Something went wrong. Please try again.' ) );
			}

			dispatch( removeNotice( noticeId ) );
			dispatch( errorNotice( translate( 'Sorry, we couldn’t send the email.' ), { duration } ) );

			recordTracksEvent( 'calypso_gravatar_powered_magic_login_email_code_failure', {
				...eventOptions,
				error_code: err?.status,
				error_message: err?.message,
			} );
		}

		setIsRequestingEmail( false );
	};

	const handleGravPoweredEmailSwitch = () => {
		setShowSecondaryEmailOptions( false );
		setShowEmailCodeVerification( false );
		setVerificationCodeInputValue( '' );
		setIsNewAccount( false );

		dispatch( hideMagicLoginRequestForm() );

		recordTracksEvent( 'calypso_gravatar_powered_magic_login_click_switch_email', {
			client_id: oauth2ClientId,
			client_name: oauth2Client?.title,
		} );
	};

	const handleGravPoweredCodeSubmit = ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		dispatch(
			fetchMagicLoginAuthenticate(
				`${ publicToken }:${ btoa( verificationCodeInputValue ) }`,
				currentQueryArguments?.redirect_to ?? '',
				oauth2Client ? getGravatarOAuth2Flow( oauth2Client ) : undefined,
				true
			)
		);
	};

	const handleGravPoweredCodeInputChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		let value = e.target.value.toUpperCase();

		if ( ! /^[A-Z0-9]*$/.test( value ) || value.length > 6 ) {
			value = verificationCodeInputValue;
		}

		setVerificationCodeInputValue( value );
	};

	const handleGravPoweredEmailSubmit = async (
		usernameOrEmail: string,
		e: React.FormEvent< HTMLFormElement >
	) => {
		e.preventDefault();

		const eventOptions = { client_id: oauth2ClientId, client_name: oauth2Client?.title };

		if ( ! emailValidator.validate( usernameOrEmail ) ) {
			return setRequestEmailErrorMessage( translate( 'Invalid email.' ) );
		}

		setUsernameOrEmail( usernameOrEmail );
		setIsRequestingEmail( true );

		try {
			recordTracksEvent(
				'calypso_gravatar_powered_magic_login_gravatar_info_fetching',
				eventOptions
			);

			const { is_secondary, main_email_masked } = await wpcom.req.get( '/auth/get-gravatar-info', {
				email: usernameOrEmail,
			} );

			if ( is_secondary ) {
				setUsernameOrEmail( usernameOrEmail );
				setIsRequestingEmail( false );
				setIsSecondaryEmail( true );
				setShowSecondaryEmailOptions( true );
				setMaskedEmailAddress( main_email_masked );
			} else {
				handleGravPoweredEmailCodeSend( usernameOrEmail );
			}

			recordTracksEvent(
				'calypso_gravatar_powered_magic_login_gravatar_info_success',
				eventOptions
			);
		} catch ( error ) {
			const err = error as { error?: string; status?: number; message?: string };

			switch ( err?.error ) {
				case 'not_found':
					setIsNewAccount( true );
					handleGravPoweredEmailCodeSend( usernameOrEmail );
					break;
				case 'invalid_email':
					setRequestEmailErrorMessage( translate( 'Invalid email.' ) );
					setIsRequestingEmail( false );
					break;
				default:
					setRequestEmailErrorMessage( translate( 'Something went wrong. Please try again.' ) );
					setIsRequestingEmail( false );
			}

			recordTracksEvent( 'calypso_gravatar_powered_magic_login_gravatar_info_failure', {
				...eventOptions,
				error_code: err.status,
				error_message: err.message,
			} );
		}
	};

	let mainContent;
	if ( showSecondaryEmailOptions ) {
		mainContent = (
			<GravPoweredSecondaryEmailOptions
				oauth2Client={ oauth2Client }
				oauth2ClientId={ oauth2ClientId }
				isGravatarFlow={ isGravatarFlow }
				usernameOrEmail={ usernameOrEmail }
				maskedEmailAddress={ maskedEmailAddress }
				isNewAccount={ isNewAccount }
				setIsNewAccount={ setIsNewAccount }
				isRequestingEmail={ isRequestingEmail }
				requestEmailErrorMessage={ requestEmailErrorMessage }
				setRequestEmailErrorMessage={ setRequestEmailErrorMessage }
				shouldShowSwitchEmail={ shouldShowSwitchEmail }
				handleGravPoweredEmailSwitch={ handleGravPoweredEmailSwitch }
				handleGravPoweredEmailCodeSend={ handleGravPoweredEmailCodeSend }
				setShowSecondaryEmailOptions={ setShowSecondaryEmailOptions }
				recordTracksEvent={ recordTracksEvent }
			/>
		);
	} else if ( showEmailCodeVerification ) {
		mainContent = (
			<GravPoweredEmailCodeVerification
				locale={ locale }
				oauth2Client={ oauth2Client }
				oauth2ClientId={ oauth2ClientId }
				isGravatarFlow={ isGravatarFlow }
				isFromGravatar3rdPartyApp={ isFromGravatar3rdPartyApp }
				usernameOrEmail={ usernameOrEmail }
				maskedEmailAddress={ maskedEmailAddress }
				isSecondaryEmail={ isSecondaryEmail }
				isNewAccount={ isNewAccount }
				verificationCodeInputValue={ verificationCodeInputValue }
				handleGravPoweredCodeInputChange={ handleGravPoweredCodeInputChange }
				handleGravPoweredCodeSubmit={ handleGravPoweredCodeSubmit }
				handleGravPoweredEmailCodeSend={ handleGravPoweredEmailCodeSend }
				resendEmailCountdown={ resendEmailCountdown }
				isRequestingEmail={ isRequestingEmail }
				shouldShowSwitchEmail={ shouldShowSwitchEmail }
				resetResendEmailCountdown={ resetResendEmailCountdown }
				handleGravPoweredEmailSwitch={ handleGravPoweredEmailSwitch }
				recordTracksEvent={ recordTracksEvent }
			/>
		);
	} else if ( showCheckYourEmail ) {
		mainContent = (
			<GravPoweredEmailLinkVerification
				oauth2Client={ oauth2Client }
				oauth2ClientId={ oauth2ClientId }
				isGravatarFlow={ isGravatarFlow }
				usernameOrEmail={ usernameOrEmail }
				currentQueryArguments={ currentQueryArguments }
				resendEmailCountdown={ resendEmailCountdown }
				resetResendEmailCountdown={ resetResendEmailCountdown }
				handleGravPoweredEmailSwitch={ handleGravPoweredEmailSwitch }
				recordTracksEvent={ recordTracksEvent }
			/>
		);
	} else {
		mainContent = (
			<GravPoweredEmailForm
				path={ path }
				oauth2Client={ oauth2Client }
				oauth2ClientId={ oauth2ClientId }
				locale={ locale }
				currentQueryArguments={ currentQueryArguments }
				isGravatar={ isGravatar }
				isGravatarFlow={ isGravatarFlow }
				isWPJobManager={ isWPJobManager }
				isFromGravatar3rdPartyApp={ isFromGravatar3rdPartyApp }
				isFromGravatarQuickEditor={ isFromGravatarQuickEditor }
				isGravatarFlowWithEmail={ isGravatarFlowWithEmail }
				showCheckYourEmail={ showCheckYourEmail }
				isRequestingEmail={ isRequestingEmail }
				requestEmailErrorMessage={ requestEmailErrorMessage }
				handleGravPoweredEmailSubmit={ handleGravPoweredEmailSubmit }
				setUsernameOrEmail={ setUsernameOrEmail }
				setRequestEmailErrorMessage={ setRequestEmailErrorMessage }
				recordTracksEvent={ recordTracksEvent }
			/>
		);
	}

	return (
		<Main
			className={ clsx( 'grav-powered-magic-login', {
				'grav-powered-magic-login--has-sub-header': hasSubHeader,
				'grav-powered-magic-login--wp-job-manager': isWPJobManager,
			} ) }
		>
			{ mainContent }
		</Main>
	);
};

export default GravPoweredMagicLogin;
