import { userEmailSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { RESEND_MIN_INTERVAL_SECONDS } from 'calypso/dashboard/utils/email-verification-resend';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { markResendUnavailableUntil } from './email-verification/storage';
import type { AnyAction } from 'redux';

/**
 * Writes a corrected address to the account the gate is holding, for a user who mistyped theirs.
 *
 * The server sends a fresh activation email to the new address, so this reports success only once
 * `/me` agrees: the gate names the address it is waiting on, and would otherwise go on naming the
 * one being corrected.
 */
export function useUpdateEmail( { flow, scope }: { flow: string; scope: string } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ error, setError ] = useState< string | null >( null );
	const { mutateAsync } = useMutation( userEmailSettingsMutation() );

	const updateEmail = async ( email: string ) => {
		setError( null );

		try {
			await mutateAsync( { user_email: email } );
		} catch ( failure ) {
			const message = failure instanceof Error ? failure.message : String( failure );
			// The server names what it refused better than this can — an address already taken,
			// or one it will not accept.
			setError( message || translate( 'Something went wrong. Please try again.' ) );
			recordTracksEvent( 'calypso_signup_email_verification_email_update_failed', {
				flow,
				error: message,
			} );
			throw failure;
		}

		// The gate reads the address from the user rather than from settings.
		await dispatch( fetchCurrentUser() as unknown as AnyAction );
		// An activation email has just gone out, so the gate opens with the same wait a send leaves.
		markResendUnavailableUntil( scope, Date.now() + RESEND_MIN_INTERVAL_SECONDS * 1000 );
		recordTracksEvent( 'calypso_signup_email_verification_email_updated', { flow } );
	};

	return { updateEmail, error };
}
