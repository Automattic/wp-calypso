import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { retrieveGooglePhotosPickerSessionCookie } from 'calypso/jetpack-connect/persistence-utils';
import { setPhotoPickerSession } from 'calypso/state/media/actions';
import getGooglePhotosPickerFeatureStatus from 'calypso/state/selectors/get-google-photos-picker-feature-status';
import getGooglePhotosPickerSession from 'calypso/state/selectors/get-google-photos-picker-session';
import {
	useCreateGooglePhotosPickerSessionMutation,
	useDeleteGooglePhotosPickerSessionMutation,
} from './use-google-photos-picker-session-mutation';
import useGooglePhotosPickerSessionQuery from './use-google-photos-picker-session-query';

export const withGooglePhotosPickerSession = createHigherOrderComponent( ( Wrapped ) => {
	return ( props ) => {
		const dispatch = useDispatch();
		const [ cachedSessionId ] = useState( retrieveGooglePhotosPickerSessionCookie() );
		const photosPickerApiEnabled = useSelector( ( state ) =>
			getGooglePhotosPickerFeatureStatus( state )
		);
		const photosPickerSession = useSelector( ( state ) => getGooglePhotosPickerSession( state ) );

		const { data: cachedSession } = useGooglePhotosPickerSessionQuery( cachedSessionId );
		const { createSession, isPending } = useCreateGooglePhotosPickerSessionMutation();
		const { mutate: deletePickerSession } = useDeleteGooglePhotosPickerSessionMutation();

		useEffect( () => {
			cachedSession && dispatch( setPhotoPickerSession( cachedSession ) );
		}, [ cachedSession, dispatch ] );

		return (
			<Wrapped
				{ ...props }
				photosPickerApiEnabled={ photosPickerApiEnabled }
				photosPickerSession={ photosPickerSession }
				deletePhotosPickerSession={ deletePickerSession }
				createPhotosPickerSession={ createSession }
				isCreatingPhotosPickerSession={ isPending }
			/>
		);
	};
}, 'WithGooglePhotosPickerSession' );
