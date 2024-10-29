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

export default function useGooglePhotosPickerSessionQuery(
	sessionId: string,
	enabled = true,
	options = {}
) {
	return useQuery( {
		queryKey: [ 'google-photos-picker-session', sessionId ],
		queryFn: (): Promise< SessionData > =>
			wp.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/meta/external-media/session/google_photos_picker/${ encodeURIComponent(
					sessionId
				) }`,
			} ),
		enabled,
		...options,
	} );
}
