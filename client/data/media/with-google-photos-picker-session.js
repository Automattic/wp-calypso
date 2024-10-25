import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import getGooglePhotoPickerSession from 'calypso/state/selectors/get-google-photo-picker-session';
import { useCreateGooglePhotosPickerSessionMutation } from './use-google-photos-picker-session-mutation';

export const withGooglePhotosPickerSession = createHigherOrderComponent( ( Wrapped ) => {
	return ( props ) => {
		const photoPickerSession = useSelector( ( state ) => getGooglePhotoPickerSession( state ) );

		const { mutate: createPickerSession } = useCreateGooglePhotosPickerSessionMutation();

		return (
			<Wrapped
				{ ...props }
				photoPickerSession={ photoPickerSession }
				createPhotoPickerSession={ createPickerSession }
			/>
		);
	};
}, 'WithGooglePhotosPickerSession' );
