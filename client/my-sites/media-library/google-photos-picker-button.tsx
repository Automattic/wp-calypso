import { Button } from '@wordpress/components';
import './google-photos-picker-button.scss';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import {
	useCreateGooglePhotosPickerSessionMutation,
	PickerSession,
} from 'calypso/data/media/use-google-photos-picker-session-mutation';
import useGooglePhotosPickerSessionQuery from 'calypso/data/media/use-google-photos-picker-session-query';
import { useDispatch, useSelector } from 'calypso/state';
import { setPhotoPickerSession } from 'calypso/state/media/actions';
import getGooglePhotosPickerSession from 'calypso/state/selectors/get-google-photos-picker-session';

const GooglePhotosPickerButton = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const session: PickerSession = useSelector( getGooglePhotosPickerSession );
	const { mutate: createSession, isPending } = useCreateGooglePhotosPickerSessionMutation();
	const { data: sessionData, refetch } = useGooglePhotosPickerSessionQuery(
		session?.id,
		!! session
	);

	const openPickerTab = () => {
		session?.pickerUri && window.open( session.pickerUri, '_blank' );
	};

	useEffect( () => {
		! session && createSession();
	}, [ session, createSession ] );

	useEffect( () => {
		const interval = setInterval( refetch, 5000 );
		return () => clearInterval( interval );
	}, [ refetch ] );

	useEffect( () => {
		sessionData && dispatch( setPhotoPickerSession( sessionData ) );
	}, [ sessionData ] );

	return (
		<div className="google-photos-picker--container media-library__connect-message">
			<p>
				{ translate(
					'Select photos directly from your Google Photos library. Click the button below to open Google’s secure photo picker in a new tab.'
				) }
			</p>
			<Button variant="primary" isBusy={ isPending } onClick={ openPickerTab }>
				{ translate( 'Open Google Photos Picker' ) }
			</Button>
			<p>
				<small>
					(
					{ translate(
						"this page will automatically update when you've completed your selection"
					) }
					)
				</small>
			</p>
		</div>
	);
};

export default GooglePhotosPickerButton;
