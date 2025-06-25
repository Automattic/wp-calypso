import page from '@automattic/calypso-router';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useEffect, useState } from 'react';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { login } from 'calypso/lib/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { rebootAfterLogin } from 'calypso/state/login/actions';
import {
	fetchMagicLoginAuthenticate,
	showMagicLoginLinkExpiredPage,
} from 'calypso/state/login/magic-login/actions';
import { LINK_EXPIRED_PAGE } from 'calypso/state/login/magic-login/constants';
import {
	getRedirectToOriginal,
	getRedirectToSanitized,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
} from 'calypso/state/login/selectors';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';
import isWooDnaFlow from 'calypso/state/selectors/is-woo-dna-flow';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import EmailedLoginLinkExpired from './emailed-login-link-expired';

interface Props {
	emailAddress: string;
	token: string;
}

const HandleEmailedLinkFormJetpackConnect: FC< Props > = ( { emailAddress, token } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ hasSubmitted, setHasSubmitted ] = useState( false );

	const redirectToOriginal = useSelector( ( state ) => getRedirectToOriginal( state ) || '' );
	const redirectToSanitized = useSelector( getRedirectToSanitized );
	const authError = useSelector( getMagicLoginRequestAuthError );
	const isAuthenticated = useSelector( getMagicLoginRequestedAuthSuccessfully );
	const isExpired = useSelector(
		( state ) => getMagicLoginCurrentView( state ) === LINK_EXPIRED_PAGE
	);
	const isWooCoreFlow = useSelector( isWooJPCFlow );
	const isWooDnaService = useSelector( isWooDnaFlow );
	const isWooFlow = isWooCoreFlow || isWooDnaService;
	const isFetching = useSelector( isFetchingMagicLoginAuth );
	const twoFactorEnabled = useSelector( isTwoFactorEnabled );
	const twoFactorNotificationSent = useSelector( getTwoFactorNotificationSent );
	const isFromAutomatticForAgenciesPlugin =
		new URLSearchParams( redirectToOriginal.split( '?' )[ 1 ] ).get( 'from' ) ===
		'automattic-for-agencies-client';

	useEffect( () => {
		if ( ! emailAddress || ! token ) {
			dispatch( showMagicLoginLinkExpiredPage() );
		} else {
			setHasSubmitted( true );
			dispatch( fetchMagicLoginAuthenticate( token, redirectToOriginal ) );
		}
	}, [] );

	// Lifted from `blocks/login`
	// @TODO move to `state/login/actions` & use both places
	const handleValidToken = useCallback( () => {
		if ( ! twoFactorEnabled ) {
			dispatch( rebootAfterLogin( { magic_login: 1 } ) );
		} else {
			page(
				login( {
					isJetpack: true,
					// If no notification is sent, the user is using the authenticator for 2FA by default
					twoFactorAuthType: twoFactorNotificationSent?.replace( 'none', 'authenticator' ),
					redirectTo: redirectToSanitized ?? undefined,
				} )
			);
		}
	}, [ dispatch, redirectToSanitized, twoFactorEnabled, twoFactorNotificationSent ] );

	useEffect( () => {
		if ( ! hasSubmitted || isFetching ) {
			// Don't do anything here unless the browser has received the `POST` response
			return;
		}

		if ( authError || ! isAuthenticated ) {
			// @TODO if this is a 5XX, or timeout, show an error...?
			dispatch( showMagicLoginLinkExpiredPage() );
			return;
		}

		handleValidToken();
	}, [ authError, dispatch, handleValidToken, hasSubmitted, isAuthenticated, isFetching ] );

	if ( isExpired ) {
		return <EmailedLoginLinkExpired emailAddress={ emailAddress } isJetpack />;
	}

	dispatch( recordTracksEvent( 'calypso_login_email_link_handle_click_view' ) );

	const renderJetpackLogo = () => {
		return (
			<div className="magic-login__gutenboarding-wordpress-logo">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
				>
					<path
						d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519938 9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6934 24 14.3734 24 12C24 8.8174 22.7357 5.76515 20.4853 3.51472C18.2348 1.26428 15.1826 0 12 0ZM11.3684 13.9895H5.40632L11.3684 2.35579V13.9895ZM12.5811 21.6189V9.98526H18.5621L12.5811 21.6189Z"
						fill="#069E08"
					/>
				</svg>
			</div>
		);
	};

	return isWooFlow || isFromAutomatticForAgenciesPlugin ? (
		<EmptyContent className="magic-login__handle-link jetpack" title={ null }>
			{ isFromAutomatticForAgenciesPlugin && <A4ALogo fullA4A size={ 58 } /> }

			<h2 className="magic-login__title empty-content__title">
				{ translate( 'Email confirmed!' ) }
			</h2>
			<h3 className="magic-login__line empty-content__line">
				{ [
					translate( 'Logging in as %(emailAddress)s', {
						args: {
							emailAddress,
						},
					} ),
					'...',
				] }
			</h3>
		</EmptyContent>
	) : (
		<Main className="magic-login">
			{ renderJetpackLogo() }

			<div className="magic-login__successfully-jetpack">
				<h1 className="magic-login__form-header">{ translate( 'Email confirmed!' ) }</h1>
				<p>
					{ translate( 'Logging in as {{strong}}%(emailAddress)s{{/strong}}…', {
						args: {
							emailAddress,
						},
						components: {
							strong: <strong></strong>,
						},
					} ) }
				</p>
				<Spinner className="magic-login__loading-spinner--jetpack" />
			</div>
		</Main>
	);
};

export default HandleEmailedLinkFormJetpackConnect;
