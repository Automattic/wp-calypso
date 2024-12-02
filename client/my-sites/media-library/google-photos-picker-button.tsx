import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import mediaImage from 'calypso/assets/images/illustrations/media.svg';
import useGooglePhotosPickerSession from 'calypso/my-sites/media-library/hook/use-google-photos-picker-session';

const GooglePhotosPickerButton = () => {
	const translate = useTranslate();
	const { session, isPending } = useGooglePhotosPickerSession();

	const openPickerTab = () => {
		session?.pickerUri && window.open( session.pickerUri, '_blank' );
	};

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
