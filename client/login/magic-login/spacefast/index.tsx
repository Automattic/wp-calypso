import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { FormLabel } from '@automattic/components';
import { getLanguage, localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import { ConsentText } from 'calypso/components/connect-screen/consent-text';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import { isSpacefastOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wpcom from 'calypso/lib/wp';
import { useLoginContext } from 'calypso/login/login-context';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';
import { useDispatch, useSelector } from 'calypso/state';
import { rebootAfterLogin } from 'calypso/state/login/actions';
import { fetchMagicLoginAuthenticate } from 'calypso/state/login/magic-login/actions';
import {
	getLastCheckedUsernameOrEmail,
	getRedirectToSanitized,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
} from 'calypso/state/login/selectors';
import {
	getCurrentOAuth2Client,
	getCurrentOAuth2ClientId,
} from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';

type ApiError = {
	error?: string;
	code?: string | number;
	message?: string;
	status?: number;
};

type CodeResponse = {
	public_token?: string;
};

export type SpacefastLoginStartResult =
	| { status: 'needs-email'; username: string }
	| { status: 'code-sent'; identifier: string; publicToken: string; createsAccount: boolean };

interface BeginSpacefastLoginOptions {
	identifier: string;
	requestAuthOptions: ( identifier: string ) => Promise< unknown >;
	sendLoginCode: ( identifier: string, createsAccount: boolean ) => Promise< CodeResponse >;
}

interface ContinueAfterSpacefastCodeOptions {
	twoFactorEnabled: boolean;
	twoFactorAuthType: string;
	redirectTo: string;
	oauth2ClientId: number;
	locale: string;
	reboot: () => void;
	navigate: ( url: string ) => void;
}

export function continueAfterSpacefastCode( {
	twoFactorEnabled,
	twoFactorAuthType,
	redirectTo,
	oauth2ClientId,
	locale,
	reboot,
	navigate,
}: ContinueAfterSpacefastCodeOptions ) {
	if ( ! twoFactorEnabled ) {
		reboot();
		return;
	}

	navigate(
		login( {
			twoFactorAuthType,
			redirectTo,
			oauth2ClientId,
			locale,
		} )
	);
}

export async function beginSpacefastLogin( {
	identifier,
	requestAuthOptions,
	sendLoginCode,
}: BeginSpacefastLoginOptions ): Promise< SpacefastLoginStartResult > {
	const normalizedIdentifier = identifier.trim();
	const looksLikeEmail = normalizedIdentifier.includes( '@' );
	const isEmail = emailValidator.validate( normalizedIdentifier );

	if ( looksLikeEmail && ! isEmail ) {
		throw new Error( 'invalid_email' );
	}

	let createsAccount = false;
	try {
		await requestAuthOptions( normalizedIdentifier );
	} catch ( error ) {
		const apiError = error as ApiError;
		if ( ( apiError.error ?? apiError.code ) !== 'unknown_user' ) {
			throw error;
		}

		if ( ! isEmail ) {
			return { status: 'needs-email', username: normalizedIdentifier };
		}

		createsAccount = true;
	}

	const { public_token: publicToken } = await sendLoginCode( normalizedIdentifier, createsAccount );
	if ( ! publicToken ) {
		throw new Error( 'missing_public_token' );
	}

	return {
		status: 'code-sent',
		identifier: normalizedIdentifier,
		publicToken,
		createsAccount,
	};
}

type LoginStep = 'identifier' | 'email' | 'code';

interface SpacefastMagicLoginViewProps {
	initialIdentifier?: string;
	locale: string;
	oauth2ClientId: number;
	redirectTo: string;
	isVerifyingCode: boolean;
	verificationError?: ApiError | null;
	beginLogin: ( identifier: string ) => Promise< SpacefastLoginStartResult >;
	verifyCode: ( token: string ) => void;
}

const getRequestErrorMessage = ( error: unknown, translate: ReturnType< typeof useTranslate > ) => {
	if ( error instanceof Error && error.message === 'invalid_email' ) {
		return translate( 'Enter a valid email address.' );
	}
	const apiError = error as ApiError;
	if ( apiError.message ) {
		return apiError.message;
	}
	return translate( 'We couldn’t send a code. Please try again.' );
};

const getVerificationErrorMessage = (
	error: ApiError | null | undefined,
	translate: ReturnType< typeof useTranslate >
) => {
	if ( error?.status === 429 || error?.code === 429 ) {
		return translate( 'Please wait a minute before trying again.' );
	}
	return translate( 'That code didn’t work. Check it and try again.' );
};

export function SpacefastMagicLoginView( {
	initialIdentifier = '',
	locale,
	oauth2ClientId,
	redirectTo,
	isVerifyingCode,
	verificationError,
	beginLogin,
	verifyCode,
}: SpacefastMagicLoginViewProps ) {
	const translate = useTranslate();
	const { setHeaders } = useLoginContext();
	const [ step, setStep ] = useState< LoginStep >( 'identifier' );
	const [ identifier, setIdentifier ] = useState( initialIdentifier );
	const [ unknownUsername, setUnknownUsername ] = useState( '' );
	const [ publicToken, setPublicToken ] = useState( '' );
	const [ verificationCode, setVerificationCode ] = useState( '' );
	const [ isRequestingCode, setIsRequestingCode ] = useState( false );
	const [ requestError, setRequestError ] = useState< string | null >( null );

	useEffect( () => {
		if ( step === 'email' ) {
			setHeaders( {
				heading: translate( 'Enter your email address' ),
				subHeading: translate(
					'We couldn’t find a WordPress.com account for “%(username)s”. Use an email address to continue.',
					{ args: { username: unknownUsername } }
				),
			} );
			return;
		}

		if ( step === 'code' ) {
			setHeaders( {
				heading: translate( 'Check your email' ),
				subHeading: translate(
					'Enter the six-character code sent to the email on your WordPress.com account.'
				),
			} );
			return;
		}

		setHeaders( {
			heading: translate( 'Log in or sign up for Spacefast' ),
			subHeading: translate( 'Continue with your WordPress.com account.' ),
		} );
	}, [ setHeaders, step, translate, unknownUsername ] );

	const requestCode = async () => {
		if ( ! identifier.trim() ) {
			return;
		}

		setIsRequestingCode( true );
		setRequestError( null );
		try {
			const result = await beginLogin( identifier );
			if ( result.status === 'needs-email' ) {
				setUnknownUsername( result.username );
				setIdentifier( '' );
				setStep( 'email' );
				return;
			}

			setIdentifier( result.identifier );
			setPublicToken( result.publicToken );
			setVerificationCode( '' );
			setStep( 'code' );
		} catch ( error ) {
			setRequestError( getRequestErrorMessage( error, translate ) );
		} finally {
			setIsRequestingCode( false );
		}
	};

	const onIdentifierSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		void requestCode();
	};

	const onCodeSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( verificationCode.length !== 6 || ! publicToken ) {
			return;
		}
		verifyCode( `${ publicToken }:${ btoa( verificationCode ) }` );
	};

	const passwordLoginUrl = login( {
		locale,
		redirectTo,
		oauth2ClientId,
		emailAddress: identifier || undefined,
	} );

	const terms = translate(
		'By continuing, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}. If you don’t have a WordPress.com account, we’ll create one.',
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

	return (
		<Main className="magic-login magic-login__request-link">
			<div className="magic-login__form">
				{ step === 'code' ? (
					<LoggedOutForm className="magic-login__form-form" onSubmit={ onCodeSubmit }>
						<FormLabel htmlFor="spacefast-verification-code">
							{ translate( 'Verification code' ) }
						</FormLabel>
						<FormFieldset className="magic-login__email-fields">
							<FormTextInput
								id="spacefast-verification-code"
								name="verificationCode"
								value={ verificationCode }
								onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
									setVerificationCode(
										event.target.value
											.toUpperCase()
											.replace( /[^A-Z0-9]/g, '' )
											.slice( 0, 6 )
									)
								}
								autoComplete="one-time-code"
								pattern="[A-Z0-9]*"
								maxLength={ 6 }
								disabled={ isVerifyingCode }
								isError={ Boolean( verificationError ) }
								autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							/>
							{ verificationError && (
								<Notice
									text={ getVerificationErrorMessage( verificationError, translate ) }
									showDismiss={ false }
									status="is-transparent-info"
								/>
							) }
							{ requestError && (
								<Notice text={ requestError } showDismiss={ false } status="is-transparent-info" />
							) }
							<div className="magic-login__form-action">
								<ActionButtons
									primaryLabel={ translate( 'Continue' ) }
									primaryType="submit"
									primaryDisabled={ verificationCode.length !== 6 }
									primaryLoading={ isVerifyingCode }
								/>
							</div>
						</FormFieldset>
					</LoggedOutForm>
				) : (
					<LoggedOutForm className="magic-login__form-form" onSubmit={ onIdentifierSubmit }>
						<FormLabel htmlFor="spacefast-identifier">
							{ step === 'email'
								? translate( 'Email address' )
								: translate( 'Email address or username' ) }
						</FormLabel>
						<FormFieldset className="magic-login__email-fields">
							<FormTextInput
								id="spacefast-identifier"
								name="usernameOrEmail"
								value={ identifier }
								onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
									setIdentifier( event.target.value );
									setRequestError( null );
								} }
								type={ step === 'email' ? 'email' : 'text' }
								autoComplete="username"
								disabled={ isRequestingCode }
								isError={ Boolean( requestError ) }
								autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							/>
							<ConsentText className="magic-login__tos wp-login__one-login-layout-tos">
								{ terms }
							</ConsentText>
							{ requestError && (
								<Notice text={ requestError } showDismiss={ false } status="is-transparent-info" />
							) }
							<div className="magic-login__form-action">
								<ActionButtons
									primaryLabel={ translate( 'Email me a code' ) }
									primaryType="submit"
									primaryDisabled={ ! identifier.trim() }
									primaryLoading={ isRequestingCode }
								/>
							</div>
						</FormFieldset>
					</LoggedOutForm>
				) }
			</div>
			<div className="one-login__footer">
				<div className="one-login__footer-links-wrapper">
					{ step === 'code' && (
						<>
							<Button
								variant="link"
								onClick={ () => void requestCode() }
								disabled={ isRequestingCode || isVerifyingCode }
							>
								{ translate( 'Send another code' ) }
							</Button>
							<Button
								variant="link"
								onClick={ () => {
									setStep( 'identifier' );
									setVerificationCode( '' );
									setRequestError( null );
								} }
							>
								{ translate( 'Use a different account' ) }
							</Button>
						</>
					) }
					<a className="one-login__footer-link" href={ passwordLoginUrl }>
						{ translate( 'Use a password or another method' ) }
					</a>
				</div>
			</div>
		</Main>
	);
}

const SpacefastMagicLogin = () => {
	const dispatch = useDispatch();
	const locale = useSelector( getCurrentLocaleSlug );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const oauth2ClientId = useSelector( getCurrentOAuth2ClientId );
	const currentQuery = useSelector( getCurrentQueryArguments ) as
		| Record< string, string >
		| undefined;
	const initialQuery = useSelector( getInitialQueryArguments );
	const lastCheckedIdentifier = useSelector( getLastCheckedUsernameOrEmail ) as string | null;
	const redirectToSanitized = useSelector( getRedirectToSanitized );
	const twoFactorEnabled = useSelector( isTwoFactorEnabled );
	const twoFactorNotificationSent = useSelector( getTwoFactorNotificationSent );
	const isVerifyingCode = useSelector( isFetchingMagicLoginAuth );
	const isCodeVerified = useSelector( getMagicLoginRequestedAuthSuccessfully );
	const verificationError = useSelector( getMagicLoginRequestAuthError );
	const redirectTo = currentQuery?.redirect_to ?? '';
	const initialIdentifier =
		lastCheckedIdentifier || currentQuery?.email_address || initialQuery?.email_address || '';

	useEffect( () => {
		if ( ! isCodeVerified || ! oauth2ClientId ) {
			return;
		}

		continueAfterSpacefastCode( {
			twoFactorEnabled,
			twoFactorAuthType:
				twoFactorNotificationSent?.replace( 'none', 'authenticator' ) ?? 'authenticator',
			redirectTo: redirectToSanitized ?? redirectTo,
			oauth2ClientId,
			locale,
			reboot: () => dispatch( rebootAfterLogin( { magic_login: 1 } ) ),
			navigate: page,
		} );
	}, [
		dispatch,
		isCodeVerified,
		locale,
		oauth2ClientId,
		redirectTo,
		redirectToSanitized,
		twoFactorEnabled,
		twoFactorNotificationSent,
	] );

	if ( ! oauth2ClientId || ! isSpacefastOAuth2Client( oauth2Client ) ) {
		return null;
	}

	const beginLogin = ( identifier: string ) =>
		beginSpacefastLogin( {
			identifier,
			requestAuthOptions: ( value ) =>
				wpcom.req.get( `/users/${ encodeURIComponent( value ) }/auth-options` ),
			sendLoginCode: ( value, createsAccount ) =>
				wpcom.req.post(
					'/auth/send-login-email',
					{ apiVersion: '1.3' },
					{
						client_id: config( 'wpcom_signup_id' ),
						client_secret: config( 'wpcom_signup_key' ),
						locale,
						lang_id: getLanguage( locale )?.value,
						email: value,
						redirect_to: redirectTo,
						flow: 'spacefast',
						create_account: createsAccount,
						tos: getToSAcceptancePayload(),
						token_type: 'code',
					}
				),
		} );

	return (
		<OneLoginLayout isJetpack={ false } isSectionSignup showLogo>
			<SpacefastMagicLoginView
				initialIdentifier={ initialIdentifier }
				locale={ locale }
				oauth2ClientId={ oauth2ClientId }
				redirectTo={ redirectTo }
				isVerifyingCode={ isVerifyingCode || isCodeVerified }
				verificationError={ verificationError }
				beginLogin={ beginLogin }
				verifyCode={ ( token ) =>
					dispatch( fetchMagicLoginAuthenticate( token, redirectTo, 'spacefast', true ) )
				}
			/>
		</OneLoginLayout>
	);
};

export default SpacefastMagicLogin;
