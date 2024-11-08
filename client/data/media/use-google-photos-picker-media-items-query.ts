import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

interface Thumbnails {
	large: string;
	medium: string;
	thumbnail: string;
	'post-thumbnail': string;
}

interface Media {
	ID: string;
	name: string;
	date: string;
	file: string;
	URL: string;
	type: string;
	mime_type: string;
	width: number;
	height: number;
	size: number;
	extension: string;
	guid: string;
	thumbnails:
		| Thumbnails
		| {
				fmt_hd: string;
				fmt_dvd: string;
				fmt_sd: string;
		  };
}

interface ResponseData {
	found: number;
	media: Media[];
	meta?: {
		next_page: boolean;
	};
	account?: {
		image: string;
		name: string;
	};
}

export default function useGooglePhotosPickerMediaItemsQuery( sessionId: string, enabled = true ) {
	return useQuery( {
		queryKey: [ 'google-photos-picker-media-items', sessionId ],
		queryFn: (): Promise< ResponseData > =>
			wp.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/meta/external-media/google_photos?session_id=${ encodeURIComponent( sessionId ) }`,
			} ),
		enabled,
	} );
}
