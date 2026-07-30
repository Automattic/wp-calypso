import { updateUserSettings } from '@automattic/api-core';
import { useCallback, useState } from 'react';

type UpdateStatus = 'idle' | 'saving' | 'error';

// Changes the current account's email via a pending email change: `/me/settings` sends a
// confirmation to the new address while the account keeps the old one until it's confirmed.
// Returns the server's canonical pending address, or null if no pending change was
// established (e.g. a no-op), so callers don't switch targets or claim a send on nothing.
export function useUpdateEmail() {
	const [ status, setStatus ] = useState< UpdateStatus >( 'idle' );

	const updateEmail = useCallback(
		async ( newEmail: string, hasPendingChange: boolean ): Promise< string | null > => {
			setStatus( 'saving' );
			try {
				// The backend rejects replacing one pending change with another within its
				// window, so cancel the current one before requesting the new address.
				if ( hasPendingChange ) {
					await updateUserSettings( { user_email_change_pending: false } );
				}
				const settings = await updateUserSettings( { user_email: newEmail } );
				setStatus( 'idle' );
				return settings.user_email_change_pending && settings.new_user_email
					? settings.new_user_email
					: null;
			} catch {
				setStatus( 'error' );
				return null;
			}
		},
		[]
	);

	return { status, updateEmail };
}
