import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import wp from 'calypso/lib/wp';
import { setPhotoPickerSession } from 'calypso/state/media/actions';

export type PickerSession = {
	id: string;
	mediaItemsSet: boolean;
	pickerUri: string;
	pollingConfig: {
		pollInterval: string;
		timeoutIn: string;
	};
	expireTime: string;
};

export function useCreateGooglePhotosPickerSessionMutation( queryOptions = {} ) {
	const dispatch = useDispatch();

	return useMutation( {
		...queryOptions,
		mutationFn: () =>
			wp.req.get( {
				path: '/meta/external-media/google_photos_picker?path=session',
			} ),
		onSuccess: ( data: PickerSession ) => {
			dispatch( setPhotoPickerSession( data ) );
		},
	} );
}

export function useDeleteGooglePhotosPickerSessionMutation( queryOptions = {} ) {
	return useMutation( {
		...queryOptions,
		mutationFn: ( sessionId: string ) =>
			wp.req.delete( {
				path: `/meta/external-media/google_photos_picker?path=session-delete&session_id=${ encodeURIComponent(
					sessionId
				) }`,
			} ),
	} );
}
