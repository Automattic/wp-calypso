import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

type PhotoMetadata = {
	focalLength: number;
	apertureFNumber: number;
	isoEquivalent: number;
	exposureTime: string;
};

type VideoMetadata = {
	fps: number;
	processingStatus: 'PROCESSING' | 'READY' | 'FAILED' | 'UNSPECIFIED';
};

type CameraMetadata = {
	width: number;
	height: number;
	cameraMake: string;
	cameraModel: string;
};

type MediaFileMetadata =
	| ( Partial< CameraMetadata > & { photoMetadata: PhotoMetadata } )
	| ( Partial< CameraMetadata > & { videoMetadata: VideoMetadata } );

type MediaFile = {
	baseUrl: string;
	mimeType: string;
	filename: string;
	mediaFileMetadata: MediaFileMetadata;
};

type PickedMediaItem = {
	id: string;
	createTime: string;
	type: 'PHOTO' | 'VIDEO' | 'TYPE_UNSPECIFIED';
	mediaFile: MediaFile;
};

interface ResponseData {
	mediaItems: PickedMediaItem[];
	nextPageToken?: string;
}

export default function useGooglePhotosPickerMediaItemsQuery( sessionId: string, enabled = true ) {
	return useQuery( {
		queryKey: [ 'google-photos-picker-media-items', sessionId ],
		queryFn: (): Promise< ResponseData > =>
			wp.req.get( {
				path:
					'/meta/external-media/google_photos_picker?path=media-items&session_id=' +
					encodeURIComponent( sessionId ),
			} ),
		enabled,
	} );
}
