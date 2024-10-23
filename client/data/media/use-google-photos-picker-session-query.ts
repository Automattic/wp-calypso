import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

interface SessionData {
	id: string;
	mediaItemsSet: boolean;
	pickerUri: string;
	pollingConfig: {
		pollInterval: string;
		timeoutIn: string;
	};
	expireTime: string;
}

export default function useGooglePhotosPickerSessionQuery( enabled = true ) {
	return useQuery( {
		queryKey: [ 'google-photos-picker-session' ],
		queryFn: (): Promise< SessionData > =>
			wp.req.get( {
				path: '/meta/external-media/google_photos_picker?path=session',
			} ),
		meta: {
			persist: false,
		},
		enabled,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}
