import { Button } from '@wordpress/components';
import './google-photos-picker-button.scss';
import useGooglePhotosPickerSessionQuery from 'calypso/data/media/use-google-photos-picker-session-query';

const GooglePhotosPickerButton = () => {
	const { data: sessionData, isLoading } = useGooglePhotosPickerSessionQuery();

	const openPickerTab = () => {
		sessionData?.pickerUri && window.open( sessionData.pickerUri, '_blank' );
	};

	return (
		<div className="google-photos-picker--container">
			<p>
				Select photos directly from your Google Photos library. Click the button below to open
				Google’s secure photo picker in a new tab. After choosing your photos, they will be
				available for use here.
			</p>
			<Button variant="primary" isBusy={ isLoading } onClick={ openPickerTab }>
				Open Google Photos Picker
			</Button>
		</div>
	);
};

export default GooglePhotosPickerButton;
