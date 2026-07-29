import { useCallback, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';

type UpdateStatus = 'idle' | 'saving' | 'error';

// Changes the current account's email via a pending email change: `PUT /me/settings` sends
// a confirmation to the new address while the account keeps the old one until it's
// confirmed. (This is why the gate's resend re-issues the change rather than calling
// /me/send-verification-email, which targets the still-current address.)
export function useUpdateEmail() {
	const dispatch = useDispatch();
	const [ status, setStatus ] = useState< UpdateStatus >( 'idle' );

	const updateEmail = useCallback(
		async ( newEmail: string ): Promise< boolean > => {
			setStatus( 'saving' );
			try {
				await wpcom.req.post( '/me/settings', { apiVersion: '1.1', user_email: newEmail } );
				// Refresh so the account step and gate see the pending change.
				dispatch( fetchCurrentUser() );
				setStatus( 'idle' );
				return true;
			} catch {
				setStatus( 'error' );
				return false;
			}
		},
		[ dispatch ]
	);

	return { status, updateEmail };
}
