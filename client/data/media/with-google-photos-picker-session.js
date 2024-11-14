import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import getGooglePhotosPickerFeatureStatus from 'calypso/state/selectors/get-google-photos-picker-feature-status';
import getGooglePhotosPickerSession from 'calypso/state/selectors/get-google-photos-picker-session';
import {
	useCreateGooglePhotosPickerSessionMutation,
	useDeleteGooglePhotosPickerSessionMutation,
} from './use-google-photos-picker-session-mutation';

export const withGooglePhotosPickerSession = createHigherOrderComponent( ( Wrapped ) => {
	return ( props ) => {
		const photosPickerApiEnabled = useSelector( ( state ) =>
			getGooglePhotosPickerFeatureStatus( state )
		);
		const photosPickerSession = useSelector( ( state ) => getGooglePhotosPickerSession( state ) );

		const { mutate: createPickerSession } = useCreateGooglePhotosPickerSessionMutation();
		const { mutate: deletePickerSession } = useDeleteGooglePhotosPickerSessionMutation();

		return (
			<Wrapped
				{ ...props }
				photosPickerApiEnabled={ photosPickerApiEnabled }
				photosPickerSession={ photosPickerSession }
				deletePhotosPickerSession={ deletePickerSession }
				createPhotosPickerSession={ createPickerSession }
			/>
		);
	};
}, 'WithGooglePhotosPickerSession' );
