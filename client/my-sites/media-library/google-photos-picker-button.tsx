import { Button } from '@wordpress/components';
import './google-photos-picker-button.scss';
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
		<div className="google-photos-picker--container">
			<p>
				Select photos directly from your Google Photos library. Click the button below to open
				Google’s secure photo picker in a new tab. After choosing your photos, they will be
				available for use here.
			</p>
			<Button variant="primary" isBusy={ isPending } onClick={ openPickerTab }>
				Open Google Photos Picker
			</Button>
		</div>
	);
};

export default GooglePhotosPickerButton;
