import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { PickerSession } from './use-google-photos-picker-session-mutation';

export default function useGooglePhotosPickerSessionQuery(
	sessionId: string | undefined,
	options = {}
) {
	const enabled = !! sessionId;

	return useQuery( {
		queryKey: [ 'google-photos-picker-session', sessionId ],
		queryFn: (): Promise< PickerSession > =>
			wp.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/meta/external-media/session/google_photos/${ encodeURIComponent(
					sessionId as string
				) }`,
			} ),
		meta: {
			persist: false,
		},
		enabled,
		...options,
	} );
}
