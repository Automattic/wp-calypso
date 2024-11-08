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
			wp.req.post( {
				apiNamespace: 'wpcom/v2',
				path: '/meta/external-media/session/google_photos',
			} ),
		onSuccess: ( data: PickerSession ) => {
			dispatch( setPhotoPickerSession( data ) );
		},
	} );
}

export function useDeleteGooglePhotosPickerSessionMutation( queryOptions = {} ) {
	const dispatch = useDispatch();

	return useMutation( {
		...queryOptions,
		mutationFn: ( sessionId: string ) =>
			wp.req.post( {
				method: 'DELETE',
				apiNamespace: 'wpcom/v2',
				path: `/meta/external-media/session/google_photos/${ encodeURIComponent( sessionId ) }`,
			} ),
		onSuccess: () => {
			dispatch( setPhotoPickerSession( null ) );
		},
	} );
}
