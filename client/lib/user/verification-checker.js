/**
 * External dependencies
 */
import debugFactory from 'debug';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';

const debug = debugFactory( 'calypso:user' );
const storageKey = '__email_verified_signal__';

export function sendVerificationSignal() {
	if ( window.localStorage ) {
		// use localStorage to signal to other browser windows that the user's email was verified
		window.localStorage.setItem( storageKey, 1 );
		debug( 'Verification: SENT SIGNAL' );
	}
}

export default function UserVerificationChecker() {
	const currentUser = useSelector( getCurrentUser );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! currentUser ) {
			// not loaded, do nothing
			return;
		}

		if ( currentUser.email_verified ) {
			// email already verified, do nothing
			return;
		}

		const postVerificationUserRefetch = ( e ) => {
			if ( e.key === storageKey && e.newValue ) {
				debug( 'Verification: RECEIVED SIGNAL' );
				window.localStorage.removeItem( storageKey );
				dispatch( fetchCurrentUser() );
			}
		};

		// wait for localStorage event (from other windows)
		window.addEventListener( 'storage', postVerificationUserRefetch );

		return () => {
			window.removeEventListener( 'storage', postVerificationUserRefetch );
		};
	}, [ currentUser, dispatch ] );

	return null;
}
