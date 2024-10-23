import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

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
	return useMutation( {
		mutationFn: () =>
			wp.req.get( {
				path: '/meta/external-media/google_photos_picker?path=session',
			} ),
		...queryOptions,
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
