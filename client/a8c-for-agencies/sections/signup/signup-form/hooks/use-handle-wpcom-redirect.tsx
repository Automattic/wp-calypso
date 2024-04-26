import config from '@automattic/calypso-config';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { AgencyDetailsPayload } from '../../agency-details-form/types';

export function useHandleWPCOMRedirect() {
	const dispatch = useDispatch();
	const userLocale = useLocale();
	const notificationId = 'a4a-agency-signup-form-wpcom-redirect';

	const handleWPCOMRedirect = useCallback(
		async ( payload: AgencyDetailsPayload ) => {
			try {
				const userValidationResponse = await wpcom.req.post( '/signups/validation/user', {
					email: payload.email,
				} );

				const isNewUser = userValidationResponse && userValidationResponse.success;
				const returnUri = new URL( '/signup/oauth/token', window.location.origin );
				const authUrl = new URL( config( 'wpcom_authorize_endpoint' ) );
				authUrl.search = new URLSearchParams( {
					response_type: 'token',
					client_id: config( 'oauth_client_id' ),
					redirect_uri: returnUri.toString(),
					scope: 'global',
				} ).toString();

				let wpcomRedirectUrl = undefined;

				if ( isNewUser ) {
					wpcomRedirectUrl = new URL(
						localizeUrl( config( 'wpcom_signup_url' ), userLocale ) + 'wpcc'
					);
					wpcomRedirectUrl.search = new URLSearchParams( {
						response_type: 'token',
						oauth2_client_id: config( 'oauth_client_id' ),
						oauth2_redirect: authUrl.toString(),
						email_address: payload.email ?? '',
					} ).toString();
				} else {
					wpcomRedirectUrl = new URL( localizeUrl( config( 'wpcom_login_url' ), userLocale ) );
					wpcomRedirectUrl.search = new URLSearchParams( {
						client_id: config( 'oauth_client_id' ),
						redirect_to: authUrl.toString(),
						email_address: payload.email ?? '',
					} ).toString();
				}

				window.location.href = wpcomRedirectUrl.toString();
			} catch ( error ) {
				dispatch( errorNotice( JSON.stringify( error ), { id: notificationId } ) );
			}
		},
		[ dispatch, userLocale ]
	);

	return handleWPCOMRedirect;
}
