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
		queryKey: [ 'google-photos-picker-session' ],
		queryFn: (): Promise< SessionData > =>
			wp.req.get( {
				path: `/meta/external-media/google_photos_picker?path=session-get&sessionId=${ encodeURIComponent(
					sessionId
				) }`,
			} ),
		enabled,
		...options,
	} );
}
