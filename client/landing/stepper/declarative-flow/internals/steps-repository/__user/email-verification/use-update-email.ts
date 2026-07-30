import { updateUserSettings } from '@automattic/api-core';
import { useCallback, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';

type UpdateStatus = 'idle' | 'saving' | 'error';

// Changes the current account's email via a pending email change: `/me/settings` sends a
// confirmation to the new address while the account keeps the old one until it's confirmed.
// Returns the server's canonical pending address, so callers verify against it rather than
// the raw submitted string.
export function useUpdateEmail() {
	const dispatch = useDispatch();
	const [ status, setStatus ] = useState< UpdateStatus >( 'idle' );

	const updateEmail = useCallback(
		async ( newEmail: string ): Promise< string | null > => {
			setStatus( 'saving' );
			try {
				const settings = await updateUserSettings( { user_email: newEmail } );
				// Refresh so downstream onboarding/analytics see the change rather than the old email.
				dispatch( fetchCurrentUser() );
				setStatus( 'idle' );
				// Only treat it as a real change when the backend established a pending one — a
				// no-op response shouldn't make the gate switch its target or claim a send.
				return settings.user_email_change_pending && settings.new_user_email
					? settings.new_user_email
					: null;
			} catch {
				setStatus( 'error' );
				return null;
			}
		},
		[ dispatch ]
	);

	return { status, updateEmail };
}
