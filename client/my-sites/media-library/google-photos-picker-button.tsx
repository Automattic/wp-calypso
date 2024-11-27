import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import mediaImage from 'calypso/assets/images/illustrations/media.svg';
import { useCreateGooglePhotosPickerSessionMutation } from 'calypso/data/media/use-google-photos-picker-session-mutation';
import useGooglePhotosPickerSessionQuery from 'calypso/data/media/use-google-photos-picker-session-query';
import { useDispatch, useSelector } from 'calypso/state';
import { setPhotoPickerSession } from 'calypso/state/media/actions';
import getGooglePhotosPickerSession from 'calypso/state/selectors/get-google-photos-picker-session';

const GooglePhotosPickerButton = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const session = useSelector( getGooglePhotosPickerSession );
	const { mutate: createSession, isPending } = useCreateGooglePhotosPickerSessionMutation();
	const { data: sessionData, refetch } = useGooglePhotosPickerSessionQuery( session?.id );

	const openPickerTab = () => {
		session?.pickerUri && window.open( session.pickerUri, '_blank' );
	};

	useEffect( () => {
		! session && createSession();
	}, [ session, createSession ] );

	useEffect( () => {
		const interval = setInterval( refetch, 3000 );
		return () => clearInterval( interval );
	}, [ refetch ] );

	useEffect( () => {
		sessionData && dispatch( setPhotoPickerSession( sessionData ) );
	}, [ sessionData ] );

	return (
		<div className="google-photos-picker--container media-library__connect-message">
			<div className="empty-content">
				<img src={ mediaImage } width="150" alt={ translate( 'Google Photos' ) } />
				<h2 className="empty-content__title">{ translate( 'Google Photos' ) }</h2>
				<h3 className="empty-content__line">
					{ translate( 'Select photos directly from your Google Photos library.' ) }
				</h3>
				<Button variant="primary" isBusy={ isPending } onClick={ openPickerTab }>
					{ translate( 'Open Google Photos Picker' ) }
					&nbsp;
					<Icon icon={ external } size={ 18 } />
				</Button>
			</div>
		</div>
	);
};

export default GooglePhotosPickerButton;
