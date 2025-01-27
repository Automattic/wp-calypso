import { useEffect } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useCreateGooglePhotosPickerSessionMutation } from 'calypso/data/media/use-google-photos-picker-session-mutation';
import useGooglePhotosPickerSessionQuery from 'calypso/data/media/use-google-photos-picker-session-query';
import { useDispatch, useSelector } from 'calypso/state';
import { setPhotoPickerSession } from 'calypso/state/media/actions';
import getGooglePhotosPickerSession from 'calypso/state/selectors/get-google-photos-picker-session';

/**
 * Hook to manage the Google Photos picker session.
 * Creates a new session:
 * - if there is no session
 * - or the current session is expired
 */
export default function useGooglePhotosPickerSession() {
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();

	const session = useSelector( getGooglePhotosPickerSession );
	const isSessionExpired =
		session?.expireTime && moment( session.expireTime ).isBefore( new Date() );

	const { createSession, isPending } = useCreateGooglePhotosPickerSessionMutation();
	const { data: sessionData, refetch } = useGooglePhotosPickerSessionQuery( session?.id );

	// Create a new session if there is no session or the current session is expired
	useEffect( () => {
		if ( ! session || isSessionExpired ) {
			createSession();
		}
	}, [ session, isSessionExpired, createSession ] );

	// Poll for session data every 3 seconds
	useEffect( () => {
		const interval = setInterval( () => {
			session && refetch();
		}, 3000 );
		return () => clearInterval( interval );
	}, [ session, refetch ] );

	// Set the session data in the store
	useEffect( () => {
		sessionData && dispatch( setPhotoPickerSession( sessionData ) );
	}, [ sessionData, dispatch ] );

	return { session, isPending };
}
