import config from '@automattic/calypso-config';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { updateNonce } from 'calypso/state/login/actions';
import { remoteLoginUser } from 'calypso/state/login/actions/remote-login-user';
import {
	getTwoFactorAuthNonce,
	getTwoFactorPushToken,
	getTwoFactorUserId,
} from 'calypso/state/login/selectors';

const POLL_APP_PUSH_INTERVAL = 5 * 1000;

async function request( state ) {
	const url = localizeUrl(
		'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint'
	);
	const body = new URLSearchParams( {
		user_id: getTwoFactorUserId( state ),
		auth_type: 'push',
		remember_me: true,
		two_step_nonce: getTwoFactorAuthNonce( state, 'push' ),
		two_step_push_token: getTwoFactorPushToken( state ),
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	} );

	const response = await fetch( url, {
		method: 'POST',
		credentials: 'include',
		body,
	} );

	return await response.json();
}

const poll = ( signal ) => async ( dispatch, getState ) => {
	let aborted = false;
	signal.addEventListener( 'abort', () => {
		aborted = true;
	} );

	// POST to `/wp-login.php` every 5 seconds until the push notification is approved and
	// the endpoint reports success.
	while ( true ) {
		try {
			const response = await request( getState() );
			// in case of success, do remote login (optionally) and break out of the loop
			if ( response.success ) {
				const tokenLinks = response.data.token_links;
				if ( Array.isArray( tokenLinks ) ) {
					await remoteLoginUser( tokenLinks );
				}
				return true;
			}

			// in case of failure (HTTP 403 response with `{ success: false }` in the JSON body),
			// read and store the new nonce and continue to poll.
			const twoStepNonce = response.data.two_step_nonce;
			// if there is a `success: false` response without a nonce, that means
			// we can't do the next iteration of the loop and we need to abort.
			if ( ! twoStepNonce ) {
				return false;
			}

			dispatch( updateNonce( 'push', twoStepNonce ) );
		} catch {
			// continue polling if the request fails with a network-ish failure, i.e., when `fetch` throws
			// an error instead of returning a `Response` or when the `response.json()` can't be read.
		}

		// the poller component that starts the polling loop will abort it on unmount
		if ( aborted ) {
			return false;
		}

		await new Promise( ( r ) => setTimeout( r, POLL_APP_PUSH_INTERVAL ) );
	}
};

export default function PushNotificationApprovalPoller( { onSuccess } ) {
	const dispatch = useDispatch();
	const savedOnSuccess = useRef();

	useEffect( () => {
		savedOnSuccess.current = onSuccess;
	}, [ onSuccess ] );

	useEffect( () => {
		const abortController = new AbortController();
		dispatch( poll( abortController.signal ) )
			.then( ( success ) => {
				if ( success ) {
					savedOnSuccess.current();
				}
			} )
			.catch( () => {} );
		return () => abortController.abort();
	}, [ dispatch ] );

	return null;
}
