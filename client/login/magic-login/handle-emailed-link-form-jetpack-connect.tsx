import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useEffect, useState } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import JetpackLogo from 'calypso/components/jetpack-logo';
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
import isWooPasswordlessJPCFlow from 'calypso/state/selectors/is-woo-passwordless-jpc-flow';
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
	const isWooCoreFlow = useSelector( isWooPasswordlessJPCFlow );
	const isWooDnaService = useSelector( isWooDnaFlow );
	const isWooFlow = isWooCoreFlow || isWooDnaService;
	const isFetching = useSelector( isFetchingMagicLoginAuth );
	const twoFactorEnabled = useSelector( isTwoFactorEnabled );
	const twoFactorNotificationSent = useSelector( getTwoFactorNotificationSent );

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
		return <EmailedLoginLinkExpired />;
	}

	dispatch( recordTracksEvent( 'calypso_login_email_link_handle_click_view' ) );

	return (
		<EmptyContent className="magic-login__handle-link jetpack" title={ null } illustration={ null }>
			{ ! isWooFlow && <JetpackLogo size={ 74 } full /> }

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
	);
};

export default HandleEmailedLinkFormJetpackConnect;
